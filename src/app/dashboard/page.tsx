import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { DUNAAI_PRICING } from "@/lib/pricing";

export default async function DashboardHomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;
  const day = new Date();
  day.setUTCHours(0, 0, 0, 0);

  let usage: Awaited<ReturnType<typeof prisma.usageStat.findUnique>> = null;
  let chats: Awaited<ReturnType<typeof prisma.chat.findMany>> = [];
  let projects = 0;
  let recentProjects: Awaited<ReturnType<typeof prisma.project.findMany>> = [];
  let subscription: Awaited<ReturnType<typeof prisma.subscription.findUnique>> = null;
  let runtimeIssue: string | null = null;

  try {
    [usage, chats, projects, recentProjects, subscription] = await Promise.all([
      prisma.usageStat.findUnique({
        where: { userId_day: { userId, day } },
      }),
      prisma.chat.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.project.count({ where: { userId } }),
      prisma.project.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 4,
      }),
      prisma.subscription.findUnique({ where: { userId } }),
    ]);
  } catch (error) {
    runtimeIssue =
      error instanceof Error
        ? error.message
        : "Dashboard data could not be loaded.";
  }

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <div>
        <p className="text-sm text-muted-foreground">Dune Network workspace</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
          Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}
        </h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline">Plan: {session?.user?.plan ?? "FREE"}</Badge>
          {subscription?.status ? (
            <Badge>Billing: {subscription.status}</Badge>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              AI requests today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">
              {usage?.requests ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tokens in
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">
              {usage?.tokensIn ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tokens out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">
              {usage?.tokensOut ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">{projects}</p>
          </CardContent>
        </Card>
      </div>

      {runtimeIssue ? (
        <Card className="border-amber-400/25 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-base text-amber-200">
              Dashboard loaded with limited data
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-amber-100/90">
            {runtimeIssue}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent chats</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/chat">Open chat</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {chats.length === 0 ? (
              <p className="text-sm text-muted-foreground">No chats yet.</p>
            ) : (
              chats.map((c) => (
                <Link
                  key={c.id}
                  href={`/dashboard/chat?chatId=${c.id}`}
                  className="block rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-sm hover:border-sky-500/30"
                >
                  <span className="font-medium text-white">
                    {c.title ?? "Untitled"}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {c.mode} · {c.updatedAt.toLocaleString()}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!recentProjects.length ? (
              <p className="text-sm text-muted-foreground">
                No projects yet. Open Coding Studio to create one.
              </p>
            ) : (
              recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href="/dashboard/studio"
                  className="block rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-sm hover:border-sky-500/30"
                >
                  <span className="font-medium text-white">{project.name}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Updated {project.updatedAt.toLocaleString()}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan & billing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Pro is {DUNAAI_PRICING.monthly.label}/month. Lifetime is {DUNAAI_PRICING.lifetime.label}.
            </p>
            <p>
              Current status:{" "}
              <span className="font-medium text-white">
                {subscription?.status ?? session.user.plan ?? "FREE"}
              </span>
            </p>
            <Button asChild size="sm">
              <Link href="/dashboard/billing">Manage billing</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
