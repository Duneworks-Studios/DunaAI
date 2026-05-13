import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function FilesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  let projects: Awaited<ReturnType<typeof prisma.project.findMany>> = [];
  let runtimeIssue: string | null = null;

  try {
    projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 30,
    });
  } catch (error) {
    runtimeIssue =
      error instanceof Error ? error.message : "Unable to load project files.";
  }

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <div>
        <h1 className="text-2xl font-semibold text-white">Files</h1>
        <p className="text-sm text-muted-foreground">
          Production project assets from Coding Studio.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {runtimeIssue ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-amber-200">
              Files are temporarily unavailable: {runtimeIssue}
            </CardContent>
          </Card>
        ) : null}
        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No projects yet. Create one from Coding Studio.
            </CardContent>
          </Card>
        ) : (
          projects.map((p) => (
            <Link key={p.id} href={`/dashboard/studio`}>
              <Card className="h-full border-white/10 bg-white/[0.02] transition hover:border-sky-500/30">
                <CardHeader>
                  <CardTitle className="text-base">{p.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-xs text-muted-foreground">
                  {p.description ? <p className="line-clamp-2">{p.description}</p> : null}
                  Updated {p.updatedAt.toLocaleString()}
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
