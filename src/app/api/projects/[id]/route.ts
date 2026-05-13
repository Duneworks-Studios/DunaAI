import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { assertSameOrigin } from "@/lib/security";

type Params = { params: Promise<{ id: string }> };

const fileSchema = z.object({
  path: z.string().min(1).max(200),
  content: z.string().max(200_000),
  language: z.string().max(50).optional(),
});

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  description: z.string().max(500).nullable().optional(),
  files: z.array(fileSchema).max(80).optional(),
});

async function resolveProject(userId: string, id: string) {
  try {
    return await prisma.project.findFirst({
      where: { id, userId },
      include: { files: { orderBy: { path: "asc" } } },
    });
  } catch {
    return null;
  }
}

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const project = await resolveProject(session.user.id, id);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      updatedAt: project.updatedAt,
      files: project.files.map((file) => ({
        id: file.id,
        path: file.path,
        content: file.content,
        language: file.language,
        updatedAt: file.updatedAt,
      })),
    },
  });
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    assertSameOrigin(request);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await resolveProject(session.user.id, id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const files = parsed.data.files;
  if (files) {
    const uniquePaths = new Set(files.map((file) => file.path));
    if (uniquePaths.size !== files.length) {
      return NextResponse.json({ error: "Duplicate file paths are not allowed" }, { status: 400 });
    }
  }

  let project:
    | {
        id: string;
        name: string;
        description: string | null;
        updatedAt: Date;
        files: Array<{
          id: string;
          path: string;
          content: string;
          language: string | null;
          updatedAt: Date;
        }>;
      }
    | null = null;
  try {
    project = await prisma.$transaction(async (tx) => {
      const updated = await tx.project.update({
        where: { id: existing.id },
        data: {
          ...(parsed.data.name ? { name: parsed.data.name } : {}),
          ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}),
          ...(files ? { filesJson: files } : {}),
        },
      });

      if (files) {
        await tx.projectFile.deleteMany({ where: { projectId: existing.id } });
        if (files.length) {
          await tx.projectFile.createMany({
            data: files.map((file) => ({
              projectId: existing.id,
              path: file.path,
              content: file.content,
              language: file.language ?? null,
            })),
          });
        }
      }

      return tx.project.findUnique({
        where: { id: updated.id },
        include: { files: { orderBy: { path: "asc" } } },
      });
    });
  } catch {
    return NextResponse.json({ error: "Could not save project right now" }, { status: 503 });
  }
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      updatedAt: project.updatedAt,
      files: project.files.map((file) => ({
        id: file.id,
        path: file.path,
        content: file.content,
        language: file.language,
        updatedAt: file.updatedAt,
      })),
    },
  });
}
