"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Loader2,
  MessageSquarePlus,
  Mic,
  RefreshCw,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MarkdownMessage, CopyBlock } from "@/components/dashboard/markdown-message";
import { ChatMode } from "@/generated/prisma/enums";
import { readErrorResponseMessage } from "@/lib/http-error";
import { cn } from "@/lib/utils";

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-0.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-2 rounded-full bg-sky-400/85"
          animate={{ y: [0, -5, 0], opacity: [0.35, 1, 0.35] }}
          transition={{
            duration: 0.85,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.14,
          }}
        />
      ))}
    </div>
  );
}

type Msg = { id: string; role: string; content: string };

type ChatRow = { id: string; title: string | null; mode: string; updatedAt: string };

function fallbackRequestError(status: number) {
  if (status === 403) {
    return "Request blocked by security policy. Please refresh and try again.";
  }
  if (status === 429) {
    return "Too many requests. Please wait a moment and retry.";
  }
  if (status === 503) {
    return "AI service is unavailable right now. Check server AI env configuration.";
  }
  return `Chat request failed (HTTP ${status}).`;
}

export function ChatWorkspace() {
  const searchParams = useSearchParams();
  const initialChatId = searchParams.get("chatId");

  const [chats, setChats] = useState<ChatRow[]>([]);
  const [chatId, setChatId] = useState<string | null>(initialChatId);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [live, setLive] = useState("");
  const [modelKind, setModelKind] = useState<"chat" | "coding">("chat");
  const [focusMode, setFocusMode] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const mode = useMemo(
    () => (modelKind === "coding" ? ChatMode.CODING : ChatMode.CHAT),
    [modelKind],
  );

  const loadChats = useCallback(async () => {
    const res = await fetch("/api/chats");
    if (!res.ok) return;
    const data = (await res.json()) as { chats: ChatRow[] };
    setChats(
      data.chats.map((c) => ({
        ...c,
        updatedAt:
          typeof c.updatedAt === "string"
            ? c.updatedAt
            : new Date(c.updatedAt).toISOString(),
      })),
    );
  }, []);

  const fetchMessages = useCallback(async (id: string) => {
    const res = await fetch(`/api/chats/${id}/messages`);
    if (!res.ok) return null;
    const data = (await res.json()) as { messages: Msg[] };
    return data.messages;
  }, []);

  const loadMessages = useCallback(
    async (id: string) => {
      const next = await fetchMessages(id);
      if (!next) return null;
      setMessages(next);
      return next;
    },
    [fetchMessages],
  );

  const appendAssistantIfMissing = useCallback((content: string) => {
    if (!content.trim()) return;
    setMessages((prev) => {
      const alreadyPresent = prev.some(
        (m) => m.role === "assistant" && m.content === content,
      );
      if (alreadyPresent) return prev;
      return [...prev, { id: crypto.randomUUID(), role: "assistant", content }];
    });
  }, []);

  useEffect(() => {
    void loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (chatId) void loadMessages(chatId);
    else setMessages([]);
  }, [chatId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, live]);

  async function streamResponse(body: Record<string, unknown>) {
    setStreaming(true);
    setLive("");
    let res: Response;
    try {
      res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      toast.error("Unable to reach chat service. Please check your connection.");
      setStreaming(false);
      return;
    }
    if (!res.ok) {
      let message =
        (await readErrorResponseMessage(res)) ?? fallbackRequestError(res.status);
      if (message.startsWith("Chat backend failed unexpectedly:")) {
        message = "Chat is temporarily degraded right now. Please retry in a moment.";
      }
      if (res.status === 401) {
        toast.error("Your session expired. Please sign in again.");
        setStreaming(false);
        return;
      }
      toast.error(message);
      setStreaming(false);
      return;
    }
    const reader = res.body?.getReader();
    if (!reader) {
      toast.error("Chat service returned an empty response. Please retry.");
      setStreaming(false);
      return;
    }
    const decoder = new TextDecoder();
    let buffer = "";
    let assistant = "";
    let activeChatId = chatId;
    let gotDone = false;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          try {
            const payload = JSON.parse(line.slice(5).trim()) as {
              type: string;
              text?: string;
              chatId?: string;
              message?: string;
            };
            if (payload.type === "meta" && payload.chatId) {
              activeChatId = payload.chatId;
              setChatId(payload.chatId);
              void loadChats();
            }
            if (payload.type === "token" && payload.text) {
              assistant += payload.text;
              setLive(assistant);
            }
            if (payload.type === "error") {
              toast.error(payload.message ?? "Engine error");
            }
            if (payload.type === "done") {
              gotDone = true;
              setLive("");
            }
          } catch {
            // Ignore malformed SSE chunk.
          }
        }
      }
    } catch {
      toast.error("Stream interrupted");
    } finally {
      const finalAssistant = assistant.trim();
      if (finalAssistant) {
        // Keep the streamed assistant visible immediately, even in degraded mode.
        appendAssistantIfMissing(finalAssistant);
      }
      setStreaming(false);
      setLive("");
      if (activeChatId && gotDone) {
        const reloaded = await fetchMessages(activeChatId);
        if (reloaded) {
          const persistedHasAssistant = finalAssistant
            ? reloaded.some(
                (m) => m.role === "assistant" && m.content === finalAssistant,
              )
            : true;
          setMessages(
            persistedHasAssistant || !finalAssistant
              ? reloaded
              : [
                  ...reloaded,
                  {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: finalAssistant,
                  },
                ],
          );
        }
      }
      void loadChats();
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    const userMsg: Msg = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    const next = [...messages, userMsg];
    setMessages(next);
    await streamResponse({
      chatId: chatId ?? undefined,
      mode,
      modelKind,
      messages: next.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
    });
  }

  async function regenerate() {
    const lastUserIdx = [...messages]
      .map((m, i) => ({ m, i }))
      .filter((x) => x.m.role === "user")
      .pop()?.i;
    if (lastUserIdx == null || !chatId) return;
    const trimmed = messages.slice(0, lastUserIdx + 1);
    setMessages(trimmed);
    await fetch(`/api/chats/${chatId}/trim`, { method: "POST" });
    await streamResponse({
      chatId,
      mode,
      modelKind,
      messages: trimmed.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
    });
  }

  function downloadLastAssistant() {
    if (typeof document === "undefined") return;
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last) return;
    const blob = new Blob([last.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dunaai-response.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  function startVoice() {
    if (typeof window === "undefined") return;
    const SR = (
      window as unknown as {
        SpeechRecognition?: new () => {
          continuous: boolean;
          interimResults: boolean;
          lang: string;
          onresult: ((e: unknown) => void) | null;
          onerror: (() => void) | null;
          start: () => void;
          stop: () => void;
        };
        webkitSpeechRecognition?: new () => {
          continuous: boolean;
          interimResults: boolean;
          lang: string;
          onresult: ((e: unknown) => void) | null;
          onerror: (() => void) | null;
          start: () => void;
          stop: () => void;
        };
      }
    ).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown })
        .webkitSpeechRecognition;
    if (!SR) {
      toast.message("Voice prompts require a compatible browser.");
      return;
    }
    type Recognition = {
      continuous: boolean;
      interimResults: boolean;
      lang: string;
      onresult: ((e: unknown) => void) | null;
      onerror: (() => void) | null;
      start: () => void;
      stop: () => void;
    };
    const Rec = SR as new () => Recognition;
    const rec = new Rec();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    setListening(true);
    rec.onresult = (e: unknown) => {
      const ev = e as {
        results: { 0: { 0: { transcript: string } } };
      };
      const text = ev.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${text}` : text));
      setListening(false);
    };
    rec.onerror = () => {
      setListening(false);
    };
    rec.start();
  }

  return (
    <div
      className={cn(
        "flex h-[calc(100dvh-52px)] flex-col md:h-dvh",
        focusMode && "fixed inset-0 z-50 h-dvh bg-black",
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside
          className={cn(
            "w-full shrink-0 border-b border-white/[0.08] bg-black/55 p-4 backdrop-blur-xl md:w-72 md:border-b-0 md:border-r",
            focusMode && "hidden",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Conversations
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2"
              onClick={() => {
                setChatId(null);
                setMessages([]);
              }}
            >
              <MessageSquarePlus className="size-4" />
            </Button>
          </div>
          <div className="mt-3 max-h-40 space-y-1 overflow-y-auto md:max-h-none">
            {chats.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setChatId(c.id)}
                className={cn(
                  "w-full rounded-xl px-3 py-2.5 text-left text-xs transition-all duration-200",
                  chatId === c.id
                    ? "border border-sky-500/25 bg-gradient-to-r from-sky-500/15 to-indigo-500/10 text-white shadow-[0_0_24px_rgba(56,189,248,0.12)]"
                    : "border border-transparent text-muted-foreground hover:border-white/10 hover:bg-white/[0.04]",
                )}
              >
                <span className="line-clamp-2 font-medium">{c.title ?? "Chat"}</span>
              </button>
            ))}
            {chats.length === 0 ? (
              <p className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 text-xs text-muted-foreground">
                No conversations yet. Start one from the composer.
              </p>
            ) : null}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div
            className={cn(
              "flex flex-wrap items-center gap-3 border-b border-white/[0.08] bg-black/40 px-4 py-3 backdrop-blur-xl",
              focusMode && "pl-14",
            )}
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Model
            </span>
            <div className="flex rounded-xl border border-white/10 bg-black/50 p-1 shadow-inner">
              <button
                type="button"
                onClick={() => setModelKind("chat")}
                className={cn(
                  "relative rounded-lg px-4 py-2 text-xs font-semibold transition",
                  modelKind === "chat"
                    ? "text-white"
                    : "text-muted-foreground hover:text-white/90",
                )}
              >
                {modelKind === "chat" ? (
                  <motion.span
                    layoutId="model-pill"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-sky-500/25 to-indigo-500/20 shadow-[0_0_24px_rgba(56,189,248,0.15)]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                ) : null}
                <span className="relative z-[1]">Duna Chat</span>
              </button>
              <button
                type="button"
                onClick={() => setModelKind("coding")}
                className={cn(
                  "relative rounded-lg px-4 py-2 text-xs font-semibold transition",
                  modelKind === "coding"
                    ? "text-white"
                    : "text-muted-foreground hover:text-white/90",
                )}
              >
                {modelKind === "coding" ? (
                  <motion.span
                    layoutId="model-pill"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-sky-500/25 to-indigo-500/20 shadow-[0_0_24px_rgba(56,189,248,0.15)]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                ) : null}
                <span className="relative z-[1]">Duna Coding</span>
              </button>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setFocusMode((f) => !f)}
                title="Focus mode"
              >
                {focusMode ? (
                  <Minimize2 className="size-4" />
                ) : (
                  <Maximize2 className="size-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                disabled={streaming || !chatId}
                onClick={regenerate}
                title="Regenerate"
              >
                <RefreshCw className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={downloadLastAssistant}
                title="Download response"
              >
                <Download className="size-4" />
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-8">
            <div className="mx-auto max-w-3xl space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-3",
                      m.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    <Card
                      className={cn(
                        "max-w-[min(92%,36rem)] border px-4 py-3 shadow-lg backdrop-blur-md transition",
                        m.role === "user"
                          ? "border-sky-500/25 bg-gradient-to-br from-sky-500/20 to-indigo-500/10"
                          : "border-white/10 bg-white/[0.04] shadow-[0_0_40px_rgba(0,0,0,0.35)]",
                      )}
                    >
                      {m.role === "assistant" ? (
                        <MarkdownMessage content={m.content} />
                      ) : (
                        <p className="whitespace-pre-wrap text-sm text-zinc-100">
                          {m.content}
                        </p>
                      )}
                      {m.role === "assistant" ? (
                        <div className="mt-2 flex gap-2">
                          <CopyBlock text={m.content} />
                        </div>
                      ) : null}
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              {streaming && !live ? (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <Card className="flex items-center gap-3 border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-md">
                    <TypingDots />
                    <span className="text-xs text-muted-foreground">DunaAI is thinking…</span>
                  </Card>
                </motion.div>
              ) : null}
              {live ? (
                <Card className="border border-white/10 bg-white/[0.04] px-4 py-3 shadow-[0_0_40px_rgba(56,189,248,0.08)] backdrop-blur-md">
                  <MarkdownMessage content={live} />
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin text-sky-400" />
                    Streaming response…
                  </div>
                </Card>
              ) : null}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="sticky bottom-0 z-10 border-t border-white/[0.08] bg-gradient-to-t from-black via-black/95 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
            <div className="mx-auto flex max-w-3xl gap-2 rounded-2xl border border-white/10 bg-black/60 p-2 shadow-[0_-20px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 rounded-xl border-white/12 bg-white/[0.03]"
                onClick={startVoice}
                disabled={listening || streaming}
                title="Voice prompt"
              >
                <Mic className={cn("size-4", listening && "text-red-400")} />
              </Button>
              <textarea
                placeholder="Message DunaAI..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                disabled={streaming}
                rows={1}
                className="min-h-10 flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[15px] shadow-inner outline-none"
              />
              <Button
                onClick={() => void send()}
                disabled={streaming}
                className="shrink-0 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 font-semibold shadow-[0_0_28px_rgba(56,189,248,0.25)]"
              >
                {streaming ? <Loader2 className="size-4 animate-spin" /> : "Send"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
