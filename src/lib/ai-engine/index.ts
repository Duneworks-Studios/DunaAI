/**
 * DunaAI internal AI engine — all inference runs server-side only.
 * Configuration is read from environment variables; never import this from client components.
 */

export type EngineModelKind = "chat" | "coding";

export type EngineMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type StreamChunk =
  | { type: "token"; text: string }
  | { type: "done"; usage?: { promptTokens: number; completionTokens: number } }
  | { type: "error"; message: string };

const DEEPSEEK_CHAT_COMPLETIONS_URL =
  "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_DEFAULT_CHAT_MODEL = "deepseek-chat";
const DEEPSEEK_DEFAULT_CODING_MODEL = DEEPSEEK_DEFAULT_CHAT_MODEL;
const ENGINE_TIMEOUT_MS = 90_000;

function resolveEndpoint(): string {
  const endpoint = process.env.DUNAAI_AI_ENDPOINT?.trim();
  if (endpoint) return endpoint;
  if (process.env.DEEPSEEK_API_KEY?.trim()) {
    return DEEPSEEK_CHAT_COMPLETIONS_URL;
  }
  throw new Error(
    "DUNAAI_AI_ENDPOINT is not configured (or set DEEPSEEK_API_KEY to use Deepseek’s default URL)",
  );
}

function resolveApiKey(): string {
  const key =
    process.env.DUNAAI_AI_API_KEY?.trim() ||
    process.env.DEEPSEEK_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "AI engine is not configured: set DEEPSEEK_API_KEY or DUNAAI_AI_API_KEY",
    );
  }
  return key;
}

function resolveModel(kind: EngineModelKind): string {
  const chat = process.env.DUNAAI_MODEL_CHAT?.trim();
  const coding = process.env.DUNAAI_MODEL_CODING?.trim();

  if (kind === "coding") {
    return coding || chat || DEEPSEEK_DEFAULT_CODING_MODEL;
  }
  return chat || DEEPSEEK_DEFAULT_CHAT_MODEL;
}

function extractProviderError(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed) as {
      error?: { message?: string } | string;
      message?: string;
    };
    if (typeof parsed.error === "string" && parsed.error.trim()) {
      return parsed.error.trim();
    }
    if (
      parsed.error &&
      typeof parsed.error === "object" &&
      typeof parsed.error.message === "string" &&
      parsed.error.message.trim()
    ) {
      return parsed.error.message.trim();
    }
    if (typeof parsed.message === "string" && parsed.message.trim()) {
      return parsed.message.trim();
    }
  } catch {
    // Not JSON. Fall through to plain text handling.
  }

  return trimmed;
}

export function getEngineConfigError(kind: EngineModelKind): string | null {
  try {
    resolveEndpoint();
    resolveApiKey();
    resolveModel(kind);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "AI engine is not configured";
  }
}

function buildSystemPrompt(kind: EngineModelKind): string {
  if (kind === "coding") {
    return [
      "You are DunaAI Coding — an advanced coding assistant built by Duneworks Studios.",
      "Prefer concise, production-quality code. Use markdown code fences with language tags.",
      "When generating multiple files, clearly separate them with path comments like // file: src/app/page.tsx",
    ].join(" ");
  }
  return [
    "You are DunaAI — a helpful assistant built by Duneworks Studios.",
    "Answer clearly and accurately. Use markdown when it improves readability.",
  ].join(" ");
}

export async function* streamCompletion(
  kind: EngineModelKind,
  messages: EngineMessage[],
  options?: { memoryContext?: string },
): AsyncGenerator<StreamChunk, void, unknown> {
  const endpoint = resolveEndpoint();
  const apiKey = resolveApiKey();
  const model = resolveModel(kind);

  const systemParts = [buildSystemPrompt(kind)];
  if (options?.memoryContext?.trim()) {
    systemParts.push(`Duna Memory (user context):\n${options.memoryContext.trim()}`);
  }
  const systemContent = systemParts.join("\n\n");

  const bodyMessages: EngineMessage[] = [
    { role: "system", content: systemContent },
    ...messages.filter((m) => m.role !== "system"),
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ENGINE_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: bodyMessages,
        stream: true,
        temperature: kind === "coding" ? 0.2 : 0.6,
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      yield {
        type: "error",
        message:
          "AI provider timed out while generating a response. Please retry.",
      };
      return;
    }
    yield {
      type: "error",
      message: "Unable to reach AI provider. Please try again.",
    };
    return;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    const providerMessage = extractProviderError(text);
    yield {
      type: "error",
      message:
        providerMessage ||
        `AI provider request failed with status ${res.status}`,
    };
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        const line = part
          .split("\n")
          .find((l) => l.startsWith("data: "));
        if (!line) continue;
        const data = line.slice("data: ".length).trim();
        if (data === "[DONE]") {
          yield { type: "done" };
          return;
        }
        try {
          const json = JSON.parse(data) as {
            choices?: Array<{
              delta?: { content?: string };
              finish_reason?: string | null;
            }>;
            usage?: {
              prompt_tokens?: number;
              completion_tokens?: number;
            };
          };
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) yield { type: "token", text: delta };
          if (json.usage) {
            yield {
              type: "done",
              usage: {
                promptTokens: json.usage.prompt_tokens ?? 0,
                completionTokens: json.usage.completion_tokens ?? 0,
              },
            };
            return;
          }
        } catch {
          // ignore malformed SSE frames
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  yield { type: "done" };
}
