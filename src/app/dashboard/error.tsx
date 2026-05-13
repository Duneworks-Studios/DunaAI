"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard route error", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-2xl flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-xl font-semibold text-white">Dashboard failed to load</h2>
      <p className="text-sm text-muted-foreground">
        A server/runtime issue interrupted this dashboard request.
      </p>
      {error.digest ? (
        <p className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-xs text-muted-foreground">
          Digest: {error.digest}
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button type="button" onClick={reset}>
          Retry
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Dashboard home</Link>
        </Button>
      </div>
    </div>
  );
}
