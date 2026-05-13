"use client";

import { useCallback, useState } from "react";
import { Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { whopCheckoutUrl } from "@/lib/whop-checkout-url";
import { cn } from "@/lib/utils";

type Props = {
  baseUrl: string | undefined;
  email?: string | null;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
};

export function WhopCheckoutButton({
  baseUrl,
  email,
  children,
  className,
  variant = "primary",
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(() => {
    if (typeof window === "undefined") return;
    const url = whopCheckoutUrl(baseUrl, email);
    if (!url) {
      toast.error("Checkout not configured. Please set Whop URLs in environment variables.");
      return;
    }

    setLoading(true);
    try {
      // Must run directly in click event (no timeout) to avoid popup blockers.
      const win = window.open(url, "_blank", "noopener,noreferrer");
      if (win) {
        win.focus();
      } else {
        // If blocked, preserve user context and fail clearly.
        toast.error("Could not open checkout. Please allow pop-ups and try again.");
      }
    } catch {
      toast.error("Could not open checkout. Please allow pop-ups and try again.");
    } finally {
      setLoading(false);
    }
  }, [baseUrl, email]);

  const isDisabled = loading;

  // Variant styles
  const variantStyles = {
    primary: cn(
      "relative overflow-hidden rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500",
      "font-semibold text-white shadow-[0_0_20px_rgba(56,189,248,0.2)]",
      "transition-all duration-300",
      "hover:shadow-[0_0_30px_rgba(56,189,248,0.35)] hover:brightness-110",
      "active:scale-[0.98]",
      "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
    ),
    secondary: cn(
      "relative overflow-hidden rounded-xl border border-white/[0.12] bg-white/[0.04]",
      "font-medium text-white",
      "transition-all duration-300",
      "hover:border-white/20 hover:bg-white/[0.08]",
      "active:scale-[0.98]",
      "disabled:opacity-60 disabled:cursor-not-allowed"
    ),
    outline: cn(
      "relative overflow-hidden rounded-xl border border-white/[0.12] bg-transparent",
      "font-medium text-white",
      "transition-all duration-300",
      "hover:border-white/25 hover:bg-white/[0.04]",
      "active:scale-[0.98]",
      "disabled:opacity-60 disabled:cursor-not-allowed"
    ),
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      whileTap={!loading ? { scale: 0.98 } : undefined}
      className={cn(
        "flex w-full items-center justify-center gap-2 px-6 py-3",
        variantStyles[variant],
        className
      )}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          <span>Opening checkout…</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          <ExternalLink className="size-3.5 opacity-60" />
        </>
      )}
    </motion.button>
  );
}
