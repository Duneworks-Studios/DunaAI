import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { assertSameOrigin } from "@/lib/security";
import { NextResponse } from "next/server";
import { z } from "zod";

const postSchema = z.object({
  content: z.string().min(1).max(20_000),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [memories, user] = await Promise.all([
    prisma.aiMemory.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: { id: true, content: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { themePreset: true },
    }),
  ]);
  return NextResponse.json({
    memories,
    themePreset: user?.themePreset ?? "duna-dark",
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

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await prisma.aiMemory.create({
    data: {
      userId: session.user.id,
      content: parsed.data.content,
    },
  });

  return NextResponse.json({ ok: true });
}
