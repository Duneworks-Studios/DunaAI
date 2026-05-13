import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: chatId } = await params;
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId: session.user.id },
  });
  if (!chat) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const lastUser = await prisma.message.findFirst({
    where: { chatId, role: "user" },
    orderBy: { createdAt: "desc" },
  });
  if (!lastUser) {
    return NextResponse.json({ ok: true });
  }

  await prisma.message.deleteMany({
    where: {
      chatId,
      createdAt: { gt: lastUser.createdAt },
    },
  });

  return NextResponse.json({ ok: true });
}
