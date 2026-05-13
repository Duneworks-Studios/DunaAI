"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function BetaShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden">
      {/* Background gradient - cinematic */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_140%_100%_at_50%_-30%,rgba(59,130,246,0.12),transparent_60%),radial-gradient(ellipse_80%_50%_at_100%_0%,rgba(99,102,241,0.08),transparent_50%),#030303]" />
      
      {/* Top announcement bar - glass effect */}
      <header className="sticky top-0 z-50 border-b border-white/[0.04] bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          <p className="text-xs text-muted-foreground/80 sm:text-sm">
            DunaAI is currently in beta. Features may change over time.
          </p>
          
          {/* Beta badge - smooth glow only, no popping */}
          <motion.span
            className="relative inline-flex shrink-0 items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-sky-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Static glow - no animation that causes popping */}
            <span className="absolute inset-0 rounded-full bg-sky-400/10 blur-md" />
            <Sparkles className="relative size-3 text-sky-300" aria-hidden />
            <span className="relative">Beta</span>
          </motion.span>
        </div>
      </header>
      
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
