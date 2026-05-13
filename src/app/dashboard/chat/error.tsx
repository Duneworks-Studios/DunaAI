"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Chat route error", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-xl font-semibold text-white">Chat is temporarily unavailable</h2>
      <p className="text-sm text-muted-foreground">
        We could not render the chat workspace due to a runtime error.
      </p>
      <div className="flex gap-2">
        <Button type="button" onClick={reset}>
          Retry
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back</Link>
        </Button>
      </div>
    </div>
  );
}
