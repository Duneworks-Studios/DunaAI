import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getEngineConfigError,
  streamCompletion,
  type EngineMessage,
} from "@/lib/ai-engine";
import { rateLimit } from "@/lib/rate-limit";
import { assertSameOrigin } from "@/lib/security";
import { ChatMode } from "@/generated/prisma/enums";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 120;

const bodySchema = z.object({
  chatId: z.string().cuid().optional(),
  mode: z.nativeEnum(ChatMode).default(ChatMode.CHAT),
  modelKind: z.enum(["chat", "coding"]),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1).max(100_000),
      }),
    )
    .min(1)
    .max(100),
});

const DEFAULT_PLAN = "FREE";

function isDbConnectivityOrRuntimeError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as {
    name?: string;
    message?: string;
    code?: string;
  };
  const name = maybeError.name ?? "";
  const code = maybeError.code ?? "";
  const message = (maybeError.message ?? "").toLowerCase();
  if (
    name === "PrismaClientInitializationError" ||
    name === "PrismaClientRustPanicError" ||
    code === "P1001" ||
    code === "P1002"
  ) {
    return true;
  }
  return (
    message.includes("can't reach database server") ||
    message.includes("cant reach database server") ||
    message.includes("failed to connect") ||
    message.includes("connection refused") ||
    message.includes("connection terminated unexpectedly") ||
    message.includes("timed out") ||
    message.includes("econnrefused") ||
    message.includes("enotfound")
  );
}

function derivePlanFromSession(session: unknown): string {
  const tokenPlan =
    typeof session === "object" &&
    session !== null &&
    "user" in session &&
    typeof session.user === "object" &&
    session.user !== null &&
    "plan" in session.user &&
    typeof session.user.plan === "string"
      ? session.user.plan
      : undefined;
  if (typeof tokenPlan === "string" && tokenPlan.trim()) {
    return tokenPlan;
  }
  return DEFAULT_PLAN;
}

function logDegraded(scope: string, error: unknown, details: Record<string, unknown>) {
  console.warn("[/api/chat] degraded mode:", scope, {
    ...details,
    error:
      error instanceof Error
        ? { name: error.name, message: error.message }
        : { value: String(error) },
  });
}

function jsonError(status: number, error: string, headers?: HeadersInit) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: Request) {
  try {
    try {
      assertSameOrigin(request);
    } catch {
      return jsonError(403, "Forbidden");
    }

    const session = await auth();
    if (!session?.user?.id) {
      return jsonError(401, "Unauthorized");
    }

    const ip = clientIp(request);
    const limit = await rateLimit(`chat:${session.user.id}:${ip}`);
    if (!limit.success) {
      return jsonError(429, "Too many requests", {
        "Retry-After": String(Math.ceil((limit.reset - Date.now()) / 1000)),
      });
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return jsonError(400, "Invalid JSON");
    }

    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return jsonError(400, "Invalid payload");
    }

    const { mode, modelKind, messages } = parsed.data;
    const kind =
      mode === ChatMode.CODING || modelKind === "coding" ? "coding" : "chat";
    const engineConfigError = getEngineConfigError(kind);
    if (engineConfigError) {
      return jsonError(503, engineConfigError);
    }

    let plan = derivePlanFromSession(session);
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { plan: true },
      });
      if (!user) {
        return jsonError(404, "User not found");
      }
      plan = user.plan;
    } catch (error) {
      if (!isDbConnectivityOrRuntimeError(error)) throw error;
      logDegraded("user lookup failed, using session/default plan", error, {
        userId: session.user.id,
      });
      plan = derivePlanFromSession(session);
    }

    const dailyCap =
      plan === "FREE" ? 40 : plan === "PRO" ? 5000 : 100_000;
    const day = new Date();
    day.setUTCHours(0, 0, 0, 0);
    let shouldTrackUsage = true;
    try {
      const usage = await prisma.usageStat.upsert({
        where: {
          userId_day: { userId: session.user.id, day },
        },
        create: { userId: session.user.id, day, requests: 0 },
        update: {},
      });
      if (usage.requests >= dailyCap) {
        return jsonError(402, "Daily usage limit reached");
      }
    } catch (error) {
      if (!isDbConnectivityOrRuntimeError(error)) throw error;
      shouldTrackUsage = false;
      logDegraded("usage lookup failed, skipping cap for request", error, {
        userId: session.user.id,
      });
    }

    let persistedChatId: string | null = null;
    let persistedChatMode: ChatMode | null = null;
    let shouldPersistChat = true;

    if (parsed.data.chatId) {
      try {
        const chat = await prisma.chat.findFirst({
          where: { id: parsed.data.chatId, userId: session.user.id },
          select: { id: true, mode: true },
        });
        if (!chat) {
          return jsonError(404, "Chat not found");
        }
        persistedChatId = chat.id;
        persistedChatMode = chat.mode;
      } catch (error) {
        if (!isDbConnectivityOrRuntimeError(error)) throw error;
        shouldPersistChat = false;
        logDegraded("chat load failed, continuing ephemeral", error, {
          userId: session.user.id,
          chatId: parsed.data.chatId,
        });
      }
    } else {
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      try {
        const chat = await prisma.chat.create({
          data: {
            userId: session.user.id,
            mode,
            title: lastUser?.content.slice(0, 80) ?? "New chat",
          },
          select: { id: true, mode: true },
        });
        persistedChatId = chat.id;
        persistedChatMode = chat.mode;
      } catch (error) {
        if (!isDbConnectivityOrRuntimeError(error)) throw error;
        shouldPersistChat = false;
        logDegraded("chat create failed, continuing ephemeral", error, {
          userId: session.user.id,
        });
      }
    }

    if (shouldPersistChat && persistedChatId && persistedChatMode !== mode) {
      try {
        await prisma.chat.update({
          where: { id: persistedChatId },
          data: { mode },
        });
      } catch (error) {
        if (!isDbConnectivityOrRuntimeError(error)) throw error;
        shouldPersistChat = false;
        logDegraded("chat mode update failed, continuing ephemeral", error, {
          userId: session.user.id,
          chatId: persistedChatId,
        });
      }
    }

    const last = messages[messages.length - 1];
    if (shouldPersistChat && persistedChatId && last?.role === "user") {
      try {
        const prev = await prisma.message.findFirst({
          where: { chatId: persistedChatId },
          orderBy: { createdAt: "desc" },
        });
        const duplicate =
          prev?.role === "user" && prev.content === last.content;
        if (!duplicate) {
          await prisma.message.create({
            data: {
              chatId: persistedChatId,
              role: "user",
              content: last.content,
            },
          });
        }
      } catch (error) {
        if (!isDbConnectivityOrRuntimeError(error)) throw error;
        shouldPersistChat = false;
        logDegraded("user message persist failed, continuing ephemeral", error, {
          userId: session.user.id,
          chatId: persistedChatId,
        });
      }
    }

    let memoryRows: Array<{ content: string }> = [];
    try {
      memoryRows = await prisma.aiMemory.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: { content: true },
      });
    } catch (error) {
      if (!isDbConnectivityOrRuntimeError(error)) throw error;
      logDegraded("memory load failed, continuing without memory context", error, {
        userId: session.user.id,
      });
    }
    const memoryBlock = memoryRows.map((m) => m.content).join("\n---\n");

    const engineMessages: EngineMessage[] = [];
    for (const m of messages) {
      if (m.role === "system") continue;
      engineMessages.push({ role: m.role, content: m.content });
    }

    const encoder = new TextEncoder();
    let assistant = "";

    const stream = new ReadableStream({
      async start(controller) {
        const send = (obj: unknown) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(obj)}\n\n`),
          );
        };
        try {
          if (persistedChatId) {
            send({ type: "meta", chatId: persistedChatId });
          }
          for await (const chunk of streamCompletion(kind, engineMessages, {
            memoryContext: memoryBlock || undefined,
          })) {
            if (chunk.type === "token") {
              assistant += chunk.text;
              send(chunk);
            } else if (chunk.type === "error") {
              send(chunk);
              break;
            } else if (chunk.type === "done") {
              if (shouldPersistChat && persistedChatId) {
                try {
                  await prisma.message.create({
                    data: {
                      chatId: persistedChatId,
                      role: "assistant",
                      content: assistant || "(empty)",
                    },
                  });
                  await prisma.chat.update({
                    where: { id: persistedChatId },
                    data: { updatedAt: new Date() },
                  });
                } catch (error) {
                  logDegraded("assistant response persist failed after stream", error, {
                    userId: session.user.id,
                    chatId: persistedChatId,
                  });
                }
              }
              if (shouldTrackUsage) {
                try {
                  await prisma.usageStat.update({
                    where: {
                      userId_day: { userId: session.user.id, day },
                    },
                    data: {
                      requests: { increment: 1 },
                      tokensIn: { increment: chunk.usage?.promptTokens ?? 0 },
                      tokensOut: { increment: chunk.usage?.completionTokens ?? 0 },
                    },
                  });
                } catch (error) {
                  logDegraded("usage update failed after stream", error, {
                    userId: session.user.id,
                  });
                }
              }
              send({ type: "done" });
              break;
            }
          }
        } catch (e) {
          const message =
            e instanceof Error ? e.message : "AI request failed unexpectedly";
          send({ type: "error", message });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : "Unexpected error while handling chat request";
    console.error("POST /api/chat failed", error);
    return jsonError(
      500,
      `Chat backend failed unexpectedly: ${message}`,
    );
  }
}
