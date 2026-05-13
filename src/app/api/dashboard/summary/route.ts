import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const day = new Date();
  day.setUTCHours(0, 0, 0, 0);

  const [usage, chats, subscription] = await Promise.all([
    prisma.usageStat.findUnique({
      where: { userId_day: { userId, day } },
    }),
    prisma.chat.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, mode: true, updatedAt: true },
    }),
    prisma.subscription.findUnique({
      where: { userId },
    }),
  ]);

  const files = await prisma.projectFile.count({
    where: { project: { userId } },
  });

  return NextResponse.json({
    usage: {
      requests: usage?.requests ?? 0,
      tokensIn: usage?.tokensIn ?? 0,
      tokensOut: usage?.tokensOut ?? 0,
    },
    recentChats: chats,
    subscription: subscription
      ? {
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        }
      : null,
    filesCount: files,
  });
}
