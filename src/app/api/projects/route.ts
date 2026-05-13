import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { assertSameOrigin } from "@/lib/security";

const fileSchema = z.object({
  path: z.string().min(1).max(200),
  content: z.string().max(200_000),
  language: z.string().max(50).optional(),
});

const createSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
  files: z.array(fileSchema).max(50).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let projects: Array<{
    id: string;
    name: string;
    description: string | null;
    updatedAt: Date;
    _count: { files: number };
  }> = [];
  try {
    projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: { _count: { select: { files: true } } },
    });
  } catch {
    return NextResponse.json({ error: "Projects are temporarily unavailable" }, { status: 503 });
  }

  return NextResponse.json({
    projects: projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      updatedAt: project.updatedAt,
      filesCount: project._count.files,
    })),
  });
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const files = parsed.data.files ?? [];
  const uniquePaths = new Set(files.map((file) => file.path));
  if (uniquePaths.size !== files.length) {
    return NextResponse.json({ error: "Duplicate file paths are not allowed" }, { status: 400 });
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
    project = await prisma.project.create({
      data: {
        userId: session.user.id,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        filesJson: files,
        files: {
          create: files.map((file) => ({
            path: file.path,
            content: file.content,
            language: file.language ?? null,
          })),
        },
      },
      include: {
        files: { orderBy: { path: "asc" } },
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not create project right now" }, { status: 503 });
  }
  if (!project) {
    return NextResponse.json({ error: "Could not create project right now" }, { status: 503 });
  }

  return NextResponse.json(
    {
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
    },
    { status: 201 },
  );
}
