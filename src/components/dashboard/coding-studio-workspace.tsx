"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  CheckCircle2,
  Clock3,
  FolderOpen,
  Loader2,
  RefreshCw,
  Save,
  Search,
  TerminalSquare,
  Undo2,
  Wrench,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  StudioAgentAction,
  StudioAgentEvent,
  StudioFile,
  StudioFileChange,
  StudioMode,
} from "@/lib/studio-agent/contracts";
import { applyStudioAction } from "@/lib/studio-agent/utils";
import { readErrorResponseMessage } from "@/lib/http-error";
import { cn } from "@/lib/utils";

type ProjectSummary = {
  id: string;
  name: string;
  description: string | null;
  updatedAt: string;
};

type AgentLog = {
  id: string;
  level: "info" | "error" | "success";
  text: string;
};

type AgentRunState = "idle" | "running" | "done" | "failed";

const MODES: Array<{ id: StudioMode; label: string; hint: string }> = [
  { id: "ask", label: "Ask", hint: "Analyze context, minimal edits" },
  { id: "edit", label: "Edit", hint: "Implement requested changes" },
  { id: "debug", label: "Debug", hint: "Find and fix breakages" },
  { id: "refactor", label: "Refactor", hint: "Restructure while preserving behavior" },
];

function uid() {
  return Math.random().toString(36).slice(2);
}

function defaultFile(): StudioFile {
  return { path: "README.md", content: "# New project\n", language: "markdown" };
}

function previewFile(files: StudioFile[]): StudioFile | null {
  if (!files.length) return null;
  const html = files.find((file) => file.path.endsWith(".html"));
  if (html) return html;
  const readme = files.find((file) => file.path.toLowerCase() === "readme.md");
  if (readme) return readme;
  return files[0] ?? null;
}

function fileStatusIcon(state: AgentRunState) {
  if (state === "running") return <Loader2 className="size-3.5 animate-spin text-sky-300" />;
  if (state === "failed") return <XCircle className="size-3.5 text-red-300" />;
  if (state === "done") return <CheckCircle2 className="size-3.5 text-emerald-300" />;
  return <Clock3 className="size-3.5 text-zinc-400" />;
}

export function CodingStudioWorkspace() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("Untitled project");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<StudioFile[]>([defaultFile()]);
  const [openTabs, setOpenTabs] = useState<string[]>(["README.md"]);
  const [activePath, setActivePath] = useState("README.md");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [agentPrompt, setAgentPrompt] = useState("");
  const [agentMode, setAgentMode] = useState<StudioMode>("edit");
  const [agentState, setAgentState] = useState<AgentRunState>("idle");
  const [agentSummary, setAgentSummary] = useState("");
  const [modifiedFiles, setModifiedFiles] = useState<StudioFileChange[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [checkpoint, setCheckpoint] = useState<StudioFile[] | null>(null);
  const [bottomTab, setBottomTab] = useState<"status" | "changes">("status");
  const activeRunRef = useRef<string | null>(null);

  const activeFile = useMemo(
    () => files.find((file) => file.path === activePath) ?? null,
    [files, activePath],
  );
  const preview = useMemo(() => previewFile(files), [files]);
  const filteredFiles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return files;
    return files.filter((file) => file.path.toLowerCase().includes(query));
  }, [files, searchTerm]);

  useEffect(() => {
    setOpenTabs((prev) => prev.filter((path) => files.some((file) => file.path === path)));
    if (!files.some((file) => file.path === activePath)) {
      setActivePath(files[0]?.path ?? "README.md");
    }
  }, [files, activePath]);

  const addLog = useCallback((level: AgentLog["level"], text: string) => {
    setLogs((prev) => [...prev, { id: uid(), level, text }]);
  }, []);

  const openFile = useCallback((path: string) => {
    setOpenTabs((prev) => (prev.includes(path) ? prev : [...prev, path]));
    setActivePath(path);
  }, []);

  const loadProject = useCallback(
    async (id: string) => {
      setLoading(true);
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) {
        toast.error("Could not open project.");
        setLoading(false);
        return;
      }
      const data = (await res.json()) as {
        project: {
          id: string;
          name: string;
          description: string | null;
          files: StudioFile[];
        };
      };
      const nextFiles = data.project.files.length ? data.project.files : [defaultFile()];
      setProjectId(data.project.id);
      setProjectName(data.project.name);
      setDescription(data.project.description ?? "");
      setFiles(nextFiles);
      setOpenTabs([nextFiles[0]?.path ?? "README.md"]);
      setActivePath(nextFiles[0]?.path ?? "README.md");
      setLoading(false);
    },
    [],
  );

  const loadProjects = useCallback(
    async (selectLatest = false) => {
      const res = await fetch("/api/projects");
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = (await res.json()) as { projects: ProjectSummary[] };
      setProjects(data.projects);
      if (selectLatest && data.projects[0]?.id) {
        await loadProject(data.projects[0].id);
        return;
      }
      setLoading(false);
    },
    [loadProject],
  );

  useEffect(() => {
    void loadProjects(true);
  }, [loadProjects]);

  async function createProject() {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Untitled project",
        files: [defaultFile()],
      }),
    });
    if (!res.ok) {
      toast.error("Unable to create project.");
      return;
    }
    const data = (await res.json()) as { project: { id: string } };
    await loadProjects();
    await loadProject(data.project.id);
  }

  async function saveProject(nextFiles = files) {
    if (!projectId) return;
    setSaving(true);
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: projectName.trim() || "Untitled project",
        description: description.trim() || null,
        files: nextFiles,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not save project.");
      return;
    }
    await loadProjects();
  }

  function updateActiveFile(content: string) {
    if (!activeFile) return;
    setFiles((prev) =>
      prev.map((file) => (file.path === activeFile.path ? { ...file, content } : file)),
    );
  }

  function applyActionInUi(action: StudioAgentAction) {
    setFiles((prev) => {
      const next = applyStudioAction(prev, action);
      if (action.type === "delete_file" && activePath === action.path) {
        const fallback = next[0]?.path ?? "README.md";
        setActivePath(fallback);
      }
      return next;
    });
    if (action.type === "create_file" || action.type === "update_file") {
      openFile(action.path);
    }
    if (action.type === "delete_file") {
      setOpenTabs((prev) => prev.filter((path) => path !== action.path));
    }
  }

  async function runStudioAgent() {
    if (!agentPrompt.trim() || agentState === "running") return;
    const runId = uid();
    activeRunRef.current = runId;
    setCheckpoint(files);
    setAgentState("running");
    setAgentSummary("");
    setModifiedFiles([]);
    setLogs([]);
    addLog("info", `Mode: ${agentMode.toUpperCase()}`);
    addLog("info", "Queued coding task...");

    const body = {
      projectId: projectId ?? undefined,
      prompt: agentPrompt.trim(),
      mode: agentMode,
      files,
    };

    let response: Response;
    try {
      response = await fetch("/api/studio/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      setAgentState("failed");
      addLog("error", "Could not reach studio agent endpoint.");
      return;
    }

    if (!response.ok) {
      const message =
        (await readErrorResponseMessage(response)) ||
        `Studio agent failed (HTTP ${response.status})`;
      setAgentState("failed");
      addLog("error", message);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      setAgentState("failed");
      addLog("error", "Studio agent returned an empty stream.");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let failed = false;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";
        for (const chunk of chunks) {
          const line = chunk.trim();
          if (!line.startsWith("data:")) continue;
          const payload = JSON.parse(line.slice(5).trim()) as StudioAgentEvent;
          if (activeRunRef.current !== runId) return;

          if (payload.type === "status") {
            addLog("info", payload.message);
          } else if (payload.type === "action") {
            applyActionInUi(payload.action);
            addLog("success", payload.message);
          } else if (payload.type === "result") {
            setFiles(payload.files);
            setModifiedFiles(payload.modifiedFiles);
            setAgentSummary(payload.summary);
            if (payload.warnings.length) {
              payload.warnings.forEach((warning) => addLog("error", warning));
            }
            if (payload.degraded) {
              addLog("error", "Running in degraded mode (database unavailable).");
            }
            if (payload.savedToProject) {
              addLog("success", "Saved updated files to project.");
            }
          } else if (payload.type === "error") {
            failed = true;
            setAgentState("failed");
            addLog("error", payload.message);
          } else if (payload.type === "done") {
            setAgentState((prev) => (prev === "failed" ? "failed" : "done"));
          }
        }
      }
      if (!failed) {
        setAgentState("done");
      }
    } catch {
      setAgentState("failed");
      addLog("error", "Agent stream interrupted.");
    }
  }

  function restoreCheckpoint() {
    if (!checkpoint) return;
    setFiles(checkpoint);
    setModifiedFiles([]);
    setAgentSummary("Checkpoint restored.");
    addLog("info", "Reverted to pre-agent checkpoint.");
  }

  return (
    <div className="relative flex min-h-[calc(100dvh-110px)] flex-col gap-3 p-3 lg:p-5">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-black/45 px-3 py-2 backdrop-blur-xl">
        <span className="text-sm font-semibold text-white">Coding Studio</span>
        <Input
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
          className="h-8 w-56 border-white/10 bg-white/[0.03] text-xs"
        />
        <Input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Project description"
          className="h-8 min-w-48 flex-1 border-white/10 bg-white/[0.03] text-xs"
        />
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void createProject()}>
            New project
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-sky-500 to-indigo-500"
            onClick={() => void saveProject()}
            disabled={saving || !projectId}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[280px_minmax(0,1fr)_350px]">
        <Card className="flex min-h-[320px] flex-col border-white/10 bg-black/45 p-3 backdrop-blur-xl">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <FolderOpen className="size-3.5" />
            Explorer
          </div>
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-2 top-2.5 size-3.5 text-zinc-500" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search files"
              className="h-8 border-white/10 bg-white/[0.03] pl-7 text-xs"
            />
          </div>
          <div className="mb-3 space-y-1">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => void loadProject(project.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs",
                  project.id === projectId
                    ? "bg-sky-500/15 text-white"
                    : "text-muted-foreground hover:bg-white/[0.05]",
                )}
              >
                <FolderOpen className="size-3.5 text-sky-300" />
                <span className="truncate">{project.name}</span>
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
            {filteredFiles.map((file) => (
              <button
                key={file.path}
                type="button"
                onClick={() => openFile(file.path)}
                className={cn(
                  "flex w-full items-center rounded-md px-2 py-1.5 text-left text-xs font-mono",
                  file.path === activePath
                    ? "bg-white/[0.12] text-white"
                    : "text-zinc-400 hover:bg-white/[0.05]",
                )}
              >
                {file.path}
              </button>
            ))}
          </div>
        </Card>

        <div className="grid min-h-0 gap-3 xl:grid-rows-[minmax(0,1fr)_220px]">
          <Card className="flex min-h-0 flex-col border-white/10 bg-black/55 p-0 backdrop-blur-xl">
            <div className="flex items-center gap-1 overflow-x-auto border-b border-white/10 px-2 py-2">
              {openTabs.map((path) => (
                <button
                  key={path}
                  type="button"
                  onClick={() => setActivePath(path)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-mono",
                    activePath === path
                      ? "bg-sky-500/20 text-white"
                      : "text-zinc-400 hover:bg-white/[0.06]",
                  )}
                >
                  {path}
                </button>
              ))}
            </div>
            {loading ? (
              <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                Loading project...
              </div>
            ) : activeFile ? (
              <textarea
                value={activeFile.content}
                onChange={(event) => updateActiveFile(event.target.value)}
                className="min-h-0 flex-1 resize-none bg-transparent p-4 font-mono text-sm text-zinc-100 outline-none"
                spellCheck={false}
              />
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                No file selected
              </div>
            )}
          </Card>

          <Card className="flex min-h-0 flex-col border-white/10 bg-black/45 p-0 backdrop-blur-xl">
            <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 text-xs">
              <button
                type="button"
                onClick={() => setBottomTab("status")}
                className={cn(
                  "rounded-md px-2 py-1",
                  bottomTab === "status"
                    ? "bg-white/[0.12] text-white"
                    : "text-zinc-400 hover:bg-white/[0.06]",
                )}
              >
                <TerminalSquare className="mr-1 inline size-3.5" />
                Tasks / Terminal
              </button>
              <button
                type="button"
                onClick={() => setBottomTab("changes")}
                className={cn(
                  "rounded-md px-2 py-1",
                  bottomTab === "changes"
                    ? "bg-white/[0.12] text-white"
                    : "text-zinc-400 hover:bg-white/[0.06]",
                )}
              >
                <Wrench className="mr-1 inline size-3.5" />
                Modified files
              </button>
              <div className="ml-auto flex items-center gap-2 text-zinc-400">
                {fileStatusIcon(agentState)}
                <span>{agentState === "idle" ? "Ready" : agentState}</span>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3 text-xs">
              {bottomTab === "status" ? (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className={cn(
                        "rounded-md border px-2 py-1.5",
                        log.level === "error"
                          ? "border-red-400/25 bg-red-500/10 text-red-200"
                          : log.level === "success"
                            ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-200"
                            : "border-white/10 bg-white/[0.03] text-zinc-300",
                      )}
                    >
                      {log.text}
                    </div>
                  ))}
                  {!logs.length ? (
                    <p className="text-zinc-500">
                      Agent activity feed will appear here.
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-2">
                  {modifiedFiles.map((file) => (
                    <div
                      key={file.path}
                      className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1.5 text-zinc-300"
                    >
                      <div className="font-mono text-[11px] text-white">{file.path}</div>
                      <div className="mt-1 flex gap-2 text-[10px] text-zinc-400">
                        <span>{file.changeType}</span>
                        <span>+{file.addedLines}</span>
                        <span>-{file.removedLines}</span>
                        <span>{file.afterBytes} bytes</span>
                      </div>
                    </div>
                  ))}
                  {!modifiedFiles.length ? (
                    <p className="text-zinc-500">
                      No file modifications recorded yet.
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card className="flex min-h-[320px] flex-col gap-3 border-white/10 bg-black/45 p-3 backdrop-blur-xl">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Preview
          </div>
          <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-white/10 bg-black/60">
            {preview?.path.endsWith(".html") ? (
              <iframe
                title="Live preview"
                className="h-full w-full bg-white"
                srcDoc={preview.content}
                sandbox="allow-scripts"
              />
            ) : (
              <pre className="h-full overflow-auto p-3 text-xs text-zinc-300">
                {preview?.content || "No preview available."}
              </pre>
            )}
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-xs text-zinc-300">
            {agentSummary || "Agent summary appears here after each run."}
          </div>
        </Card>
      </div>

      <div className="fixed bottom-4 right-4 z-20 w-[min(420px,calc(100vw-2rem))] rounded-xl border border-white/15 bg-black/80 p-3 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
          <Bot className="size-4 text-sky-300" />
          AI Agent
        </div>
        <div className="mb-2 flex flex-wrap gap-1">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setAgentMode(mode.id)}
              className={cn(
                "rounded-md px-2 py-1 text-xs",
                agentMode === mode.id
                  ? "bg-sky-500/25 text-white"
                  : "bg-white/[0.04] text-zinc-400 hover:text-white",
              )}
              title={mode.hint}
            >
              {mode.label}
            </button>
          ))}
        </div>
        <textarea
          value={agentPrompt}
          onChange={(event) => setAgentPrompt(event.target.value)}
          placeholder="Describe the coding task..."
          className="mb-2 min-h-24 w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] p-2 text-sm outline-none"
        />
        <div className="flex gap-2">
          <Button
            onClick={() => void runStudioAgent()}
            disabled={agentState === "running"}
            className="flex-1 bg-gradient-to-r from-sky-500 to-indigo-500"
          >
            {agentState === "running" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Run task
          </Button>
          <Button variant="outline" onClick={restoreCheckpoint} disabled={!checkpoint}>
            <Undo2 className="size-4" />
            Undo
          </Button>
        </div>
      </div>
    </div>
  );
}
