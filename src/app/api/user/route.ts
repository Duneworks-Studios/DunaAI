import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { assertSameOrigin } from "@/lib/security";
import { NextResponse } from "next/server";
import { z } from "zod";

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
  image: z.string().url().max(2000).nullable().optional(),
  themePreset: z.string().min(1).max(40).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let user: {
    id: string;
    email: string;
    name: string | null;
    username: string | null;
    image: string | null;
    plan: string;
    themePreset: string;
  } | null = null;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        image: true,
        plan: true,
        themePreset: true,
      },
    });
  } catch {
    return NextResponse.json({ error: "User profile is temporarily unavailable" }, { status: 503 });
  }
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
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

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    if (parsed.data.username) {
      const normalizedUsername = parsed.data.username.trim().toLowerCase();
      const taken = await prisma.user.findFirst({
        where: {
          username: normalizedUsername,
          NOT: { id: session.user.id },
        },
      });
      if (taken) {
        return NextResponse.json({ error: "Username taken" }, { status: 409 });
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(parsed.data.name != null ? { name: parsed.data.name } : {}),
        ...(parsed.data.username != null
          ? { username: parsed.data.username.trim().toLowerCase() }
          : {}),
        ...(parsed.data.image !== undefined ? { image: parsed.data.image } : {}),
        ...(parsed.data.themePreset != null
          ? { themePreset: parsed.data.themePreset }
          : {}),
      },
    });
  } catch {
    return NextResponse.json({ error: "Profile update failed. Try again later." }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
