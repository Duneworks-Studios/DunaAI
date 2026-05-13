import { z } from "zod";

const relationalFileSchema = z.object({
  id: z.string().optional(),
  path: z.string().min(1).max(300),
  content: z.string(),
  language: z.string().nullable().optional(),
});

const jsonFileSchema = z.object({
  path: z.string().min(1).max(300),
  content: z.string(),
  language: z.string().nullable().optional(),
});

const jsonFileArraySchema = z.array(jsonFileSchema).max(500);

export type ProjectApiFile = {
  id?: string;
  path: string;
  content: string;
  language: string | null;
};

export function resolveProjectFiles(
  relationalFiles: unknown,
  serializedFilesJson: unknown,
): ProjectApiFile[] {
  const parsedRelational = z.array(relationalFileSchema).safeParse(relationalFiles);
  if (parsedRelational.success && parsedRelational.data.length > 0) {
    return parsedRelational.data.map((file) => ({
      id: file.id,
      path: file.path,
      content: file.content,
      language: file.language ?? null,
    }));
  }

  const parsedJson = jsonFileArraySchema.safeParse(serializedFilesJson);
  if (parsedJson.success && parsedJson.data.length > 0) {
    return parsedJson.data.map((file) => ({
      path: file.path,
      content: file.content,
      language: file.language ?? null,
    }));
  }

  return [];
}
