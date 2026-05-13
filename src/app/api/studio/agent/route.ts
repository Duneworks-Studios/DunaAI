import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  studioAgentPlanSchema,
  studioAgentRequestSchema,
  type StudioAgentAction,
  type StudioAgentEvent,
  type StudioFile,
} from "@/lib/studio-agent/contracts";
import {
  applyStudioAction,
  buildModeInstruction,
  isSafeStudioPath,
  parseAgentPlanFromText,
  summarizeFileChanges,
} from "@/lib/studio-agent/utils";
import { streamCompletion } from "@/lib/ai-engine";
import { rateLimit } from "@/lib/rate-limit";
import { assertSameOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const maxDuration = 180;

function jsonError(status: number, error: string) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

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

function buildPlannerPrompt(files: StudioFile[], requestPrompt: string, mode: string) {
  const compactFiles = files
    .slice(0, 80)
    .map(
      (file) =>
        `PATH: ${file.path}\nCONTENT:\n${file.content.slice(0, 3000)}${
          file.content.length > 3000 ? "\n...[truncated]" : ""
        }`,
    )
    .join("\n\n---\n\n");
  return [
    "You are DunaAI Coding Studio Agent.",
    "Output MUST be valid JSON only.",
    "Never wrap JSON in markdown fences.",
    "You are planning file operations for an IDE workspace.",
    buildModeInstruction(mode as "ask" | "edit" | "debug" | "refactor"),
    'Use only these action types: "create_file", "update_file", "delete_file", "create_folder", "read_file".',
    "Prefer minimal surgical changes.",
    "Do not dump long code in summary; place code inside action.content only when file must be created/updated.",
    "JSON shape:",
    JSON.stringify(
      {
        summary: "One sentence summary",
        actions: [
          {
            type: "update_file",
            path: "src/app/page.tsx",
            content: "<full new file content>",
            reason: "why this edit is needed",
          },
        ],
        notes: ["optional concise note"],
      },
      null,
      2,
    ),
    `User request:\n${requestPrompt}`,
    `Current project files:\n${compactFiles || "(empty workspace)"}`,
  ].join("\n\n");
}

async function generatePlan(files: StudioFile[], prompt: string, mode: string) {
  let raw = "";
  for await (const chunk of streamCompletion(
    "coding",
    [{ role: "user", content: buildPlannerPrompt(files, prompt, mode) }],
    undefined,
  )) {
    if (chunk.type === "token") raw += chunk.text;
    if (chunk.type === "error") {
      throw new Error(chunk.message);
    }
  }

  const parsed = parseAgentPlanFromText(raw);
  if (!parsed) {
    throw new Error("The coding planner returned an invalid response.");
  }
  return studioAgentPlanSchema.parse(parsed);
}

async function saveProjectFiles(projectId: string, userId: string, files: StudioFile[]) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.project.findFirst({
      where: { id: projectId, userId },
      select: { id: true },
    });
    if (!existing) return false;

    await tx.projectFile.deleteMany({ where: { projectId } });
    if (files.length) {
      await tx.projectFile.createMany({
        data: files.map((file) => ({
          projectId,
          path: file.path,
          content: file.content,
          language: file.language ?? null,
        })),
      });
    }
    await tx.project.update({
      where: { id: projectId },
      data: { filesJson: files },
    });
    return true;
  });
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

    const limit = await rateLimit(`studio-agent:${session.user.id}:${clientIp(request)}`);
    if (!limit.success) {
      return jsonError(429, "Too many requests");
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return jsonError(400, "Invalid JSON");
    }

    const parsed = studioAgentRequestSchema.safeParse(json);
    if (!parsed.success) {
      return jsonError(400, "Invalid payload");
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: StudioAgentEvent) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        };

        const warnings: string[] = [];
        let degraded = false;
        let savedToProject = false;

        try {
          send({
            type: "status",
            stage: "analyzing",
            message: "Analyzing workspace context",
          });

          let baseFiles = parsed.data.files;
          if (parsed.data.projectId) {
            try {
              const project = await prisma.project.findFirst({
                where: { id: parsed.data.projectId, userId: session.user.id },
                include: { files: { orderBy: { path: "asc" } } },
              });
              if (project) {
                baseFiles = project.files.map((file) => ({
                  id: file.id,
                  path: file.path,
                  content: file.content,
                  language: file.language,
                }));
              }
            } catch (error) {
              if (!isDbConnectivityOrRuntimeError(error)) {
                throw error;
              }
              degraded = true;
              warnings.push(
                "Database is unavailable. Running in local studio memory mode.",
              );
            }
          }

          send({
            type: "status",
            stage: "planning",
            message: `Planning ${parsed.data.mode} operations`,
          });

          const plan = await generatePlan(baseFiles, parsed.data.prompt, parsed.data.mode);
          let nextFiles = [...baseFiles];
          const safeActions: StudioAgentAction[] = [];

          send({
            type: "status",
            stage: "executing",
            message: `Executing ${plan.actions.length} workspace actions`,
          });

          for (const [index, action] of plan.actions.entries()) {
            if (!isSafeStudioPath(action.path)) {
              warnings.push(`Skipped unsafe path: ${action.path}`);
              continue;
            }
            safeActions.push(action);
            nextFiles = applyStudioAction(nextFiles, action);
            send({
              type: "action",
              action,
              index: index + 1,
              total: plan.actions.length,
              message:
                action.reason ??
                `${action.type.replace(/_/g, " ")} ${action.path}`,
            });
          }

          const modifiedFiles = summarizeFileChanges(baseFiles, nextFiles);
          if (parsed.data.projectId && !degraded) {
            send({
              type: "status",
              stage: "saving",
              message: "Saving project changes",
            });
            try {
              savedToProject = await saveProjectFiles(
                parsed.data.projectId,
                session.user.id,
                nextFiles,
              );
            } catch (error) {
              if (!isDbConnectivityOrRuntimeError(error)) {
                throw error;
              }
              degraded = true;
              warnings.push(
                "Could not save to database. Changes are kept in studio state only.",
              );
            }
          }

          send({
            type: "result",
            summary:
              modifiedFiles.length > 0
                ? plan.summary
                : `${plan.summary} No file changes were required.`,
            files: nextFiles,
            modifiedFiles,
            warnings,
            degraded,
            savedToProject,
          });
          send({
            type: "status",
            stage: "done",
            message: "Agent run completed",
          });
          send({ type: "done" });
        } catch (error) {
          send({
            type: "error",
            message:
              error instanceof Error
                ? error.message
                : "Studio agent failed unexpectedly",
          });
          send({ type: "done" });
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
    console.error("POST /api/studio/agent failed", error);
    return jsonError(500, "Unexpected error while handling studio agent request");
  }
}
