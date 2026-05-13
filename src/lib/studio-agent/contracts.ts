import { z } from "zod";

export const studioModeSchema = z.enum(["ask", "edit", "debug", "refactor"]);

export const studioFileSchema = z.object({
  id: z.string().optional(),
  path: z.string().min(1).max(300),
  content: z.string().max(300_000),
  language: z.string().max(50).nullable().optional(),
});

export const studioAgentActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("create_file"),
    path: z.string().min(1).max(300),
    content: z.string().max(300_000),
    reason: z.string().max(500).optional(),
  }),
  z.object({
    type: z.literal("update_file"),
    path: z.string().min(1).max(300),
    content: z.string().max(300_000),
    reason: z.string().max(500).optional(),
  }),
  z.object({
    type: z.literal("delete_file"),
    path: z.string().min(1).max(300),
    reason: z.string().max(500).optional(),
  }),
  z.object({
    type: z.literal("create_folder"),
    path: z.string().min(1).max(300),
    reason: z.string().max(500).optional(),
  }),
  z.object({
    type: z.literal("read_file"),
    path: z.string().min(1).max(300),
    reason: z.string().max(500).optional(),
  }),
]);

export const studioAgentPlanSchema = z.object({
  summary: z.string().max(2_000).default("Applied coding plan."),
  actions: z.array(studioAgentActionSchema).max(120),
  notes: z.array(z.string().max(400)).max(24).optional(),
});

export const studioAgentRequestSchema = z.object({
  projectId: z.string().cuid().optional(),
  prompt: z.string().min(3).max(12_000),
  mode: studioModeSchema,
  files: z.array(studioFileSchema).max(250).default([]),
});

export type StudioMode = z.infer<typeof studioModeSchema>;
export type StudioFile = z.infer<typeof studioFileSchema>;
export type StudioAgentRequest = z.infer<typeof studioAgentRequestSchema>;
export type StudioAgentAction = z.infer<typeof studioAgentActionSchema>;
export type StudioAgentPlan = z.infer<typeof studioAgentPlanSchema>;

export type StudioFileChange = {
  path: string;
  changeType: "created" | "updated" | "deleted";
  addedLines: number;
  removedLines: number;
  beforeBytes: number;
  afterBytes: number;
};

export type StudioAgentEvent =
  | {
      type: "status";
      stage: "analyzing" | "planning" | "executing" | "saving" | "done";
      message: string;
    }
  | {
      type: "action";
      action: StudioAgentAction;
      index: number;
      total: number;
      message: string;
    }
  | {
      type: "result";
      summary: string;
      files: StudioFile[];
      modifiedFiles: StudioFileChange[];
      warnings: string[];
      degraded: boolean;
      savedToProject: boolean;
    }
  | {
      type: "error";
      message: string;
    }
  | {
      type: "done";
    };
