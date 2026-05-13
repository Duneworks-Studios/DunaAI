"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PricingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Pricing route error", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-xl font-semibold text-white">Pricing failed to render</h2>
      <p className="text-sm text-muted-foreground">
        Please retry. Checkout links and plans are still preserved.
      </p>
      <div className="flex gap-2">
        <Button type="button" onClick={reset}>
          Retry
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
