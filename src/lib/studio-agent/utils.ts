import type {
  StudioAgentAction,
  StudioAgentPlan,
  StudioFile,
  StudioFileChange,
  StudioMode,
} from "@/lib/studio-agent/contracts";

function normalizePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/\/+/g, "/").replace(/^\.?\//, "");
}

export function isSafeStudioPath(path: string): boolean {
  const normalized = normalizePath(path).trim();
  return Boolean(
    normalized &&
      !normalized.startsWith("/") &&
      !normalized.includes("../") &&
      !normalized.includes("..\\") &&
      !normalized.includes("\0"),
  );
}

export function parseAgentPlanFromText(text: string): StudioAgentPlan | null {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace <= firstBrace) return null;
  const candidate = text.slice(firstBrace, lastBrace + 1);
  try {
    return JSON.parse(candidate) as StudioAgentPlan;
  } catch {
    return null;
  }
}

export function buildModeInstruction(mode: StudioMode): string {
  if (mode === "ask") {
    return "Ask mode: prefer analysis and minimal edits. Only modify files when clearly needed.";
  }
  if (mode === "debug") {
    return "Debug mode: prioritize targeted fixes and diagnostics over broad refactors.";
  }
  if (mode === "refactor") {
    return "Refactor mode: improve structure and maintain behavior; avoid unnecessary feature expansion.";
  }
  return "Edit mode: implement requested product/code changes directly with practical scope.";
}

export function applyStudioAction(
  files: StudioFile[],
  action: StudioAgentAction,
): StudioFile[] {
  if (!isSafeStudioPath(action.path)) return files;
  const path = normalizePath(action.path);
  if (action.type === "delete_file") {
    return files.filter((file) => normalizePath(file.path) !== path);
  }
  if (action.type === "create_folder" || action.type === "read_file") {
    return files;
  }

  const next = [...files];
  const existingIndex = next.findIndex((file) => normalizePath(file.path) === path);
  const incoming: StudioFile = {
    path,
    content: action.content,
    language: inferLanguage(path),
  };

  if (existingIndex >= 0) {
    next[existingIndex] = { ...next[existingIndex], ...incoming };
    return next;
  }
  next.push(incoming);
  next.sort((a, b) => a.path.localeCompare(b.path));
  return next;
}

function inferLanguage(path: string): string | null {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  if (!ext || ext === path) return null;
  if (ext === "ts" || ext === "tsx") return "typescript";
  if (ext === "js" || ext === "jsx") return "javascript";
  if (ext === "md") return "markdown";
  if (ext === "json") return "json";
  if (ext === "css") return "css";
  if (ext === "html") return "html";
  return ext;
}

export function summarizeFileChanges(
  before: StudioFile[],
  after: StudioFile[],
): StudioFileChange[] {
  const beforeMap = new Map(before.map((file) => [normalizePath(file.path), file]));
  const afterMap = new Map(after.map((file) => [normalizePath(file.path), file]));
  const allPaths = new Set([...beforeMap.keys(), ...afterMap.keys()]);
  const changes: StudioFileChange[] = [];

  for (const path of allPaths) {
    const prev = beforeMap.get(path);
    const next = afterMap.get(path);
    if (!prev && next) {
      changes.push({
        path,
        changeType: "created",
        addedLines: lineCount(next.content),
        removedLines: 0,
        beforeBytes: 0,
        afterBytes: byteLength(next.content),
      });
      continue;
    }
    if (prev && !next) {
      changes.push({
        path,
        changeType: "deleted",
        addedLines: 0,
        removedLines: lineCount(prev.content),
        beforeBytes: byteLength(prev.content),
        afterBytes: 0,
      });
      continue;
    }
    if (prev && next && prev.content !== next.content) {
      const prevLines = prev.content.split("\n");
      const nextLines = next.content.split("\n");
      changes.push({
        path,
        changeType: "updated",
        addedLines: Math.max(nextLines.length - prevLines.length, 0),
        removedLines: Math.max(prevLines.length - nextLines.length, 0),
        beforeBytes: byteLength(prev.content),
        afterBytes: byteLength(next.content),
      });
    }
  }

  return changes.sort((a, b) => a.path.localeCompare(b.path));
}

function lineCount(content: string): number {
  if (!content) return 0;
  return content.split("\n").length;
}

function byteLength(content: string): number {
  return new TextEncoder().encode(content).length;
}
