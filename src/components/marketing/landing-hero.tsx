"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useSpring } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Brain,
  Code2,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TYPING_LINES = [
  "Scaffolding routes, Prisma models, and a glass dashboard shell…",
  "Streaming tokens with zero vendor leakage on the wire.",
  "Duna Memory keeps your context aligned across sessions.",
];

const PREVIEW_CAPABILITIES = [
  { icon: Brain, label: "Memory" },
  { icon: Code2, label: "Studio" },
  { icon: Layers, label: "Focus" },
  { icon: Zap, label: "Deploy" },
];

export function LandingHero() {
  const wrap = useRef<HTMLDivElement>(null);
  const mx = useSpring(50, { stiffness: 60, damping: 30 });
  const my = useSpring(35, { stiffness: 60, damping: 30 });
  const spotlight = useMotionTemplate`radial-gradient(800px circle at ${mx}% ${my}%, rgba(56,189,248,0.12), transparent 60%)`;

  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    const line = TYPING_LINES[lineIdx] ?? "";
    if (charIdx < line.length) {
      const t = window.setTimeout(() => setCharIdx((c) => c + 1), 32);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      setLineIdx((i) => (i + 1) % TYPING_LINES.length);
      setCharIdx(0);
    }, 2800);
    return () => window.clearTimeout(t);
  }, [lineIdx, charIdx]);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = wrap.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    mx.set(x);
    my.set(y);
  }

  const typed = (TYPING_LINES[lineIdx] ?? "").slice(0, charIdx);

  return (
    <section
      ref={wrap}
      onMouseMove={onMove}
      className="relative overflow-hidden px-4 pb-24 pt-10 sm:px-6 lg:pt-16"
    >
      {/* Grid background - no mask artifacts */}
      <div className="pointer-events-none absolute inset-0 bg-duna-grid opacity-40" />
      
      {/* Mouse spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: spotlight }}
      />

      {/* Floating orbs - subtle depth */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-[10%] top-[20%] size-64 rounded-full bg-sky-500/5 blur-[100px]"
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[15%] top-[30%] size-48 rounded-full bg-indigo-500/5 blur-[80px]"
          animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        {/* Beta badge + tagline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Badge className="border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
            Beta
          </Badge>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-xs text-muted-foreground backdrop-blur-md">
            <Sparkles className="size-3.5 text-sky-300" />
            Part of Dune Network · Built by Duneworks Studios
          </div>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
        >
          The AI workspace
          <span className="mt-2 block bg-gradient-to-r from-sky-200 via-white to-indigo-200 bg-clip-text text-transparent">
            built for builders
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Cinematic UI, disciplined inference, and a calm cockpit for chat, 
          code, billing, and team workflows.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Button
            size="lg"
            asChild
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-8 font-semibold shadow-[0_0_40px_rgba(56,189,248,0.2)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(56,189,248,0.35)]"
          >
            <Link href="/signup" className="flex items-center gap-2">
              Start free
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            asChild 
            className="rounded-full border-white/10 bg-white/[0.03] px-8 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]"
          >
            <Link href="/pricing">View pricing</Link>
          </Button>
        </motion.div>
      </div>

      {/* Preview window */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto mt-16 max-w-5xl px-2 sm:px-0"
      >
        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent p-[1px] shadow-[0_0_80px_rgba(56,189,248,0.1)] transition-shadow duration-500 hover:shadow-[0_0_100px_rgba(56,189,248,0.15)]">
          <div className="rounded-[15px] bg-[#0a0a0c]/95 p-4 sm:p-5">
            {/* Window header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-[#ff5f57]/80" />
                  <div className="size-3 rounded-full bg-[#febc2e]/80" />
                  <div className="size-3 rounded-full bg-[#28c840]/80" />
                </div>
                <div className="ml-3 flex items-center gap-2 text-sm font-medium text-white/90">
                  <Bot className="size-4 text-sky-300" />
                  DunaAI
                </div>
              </div>
              <Badge variant="outline" className="border-white/10 text-[10px] text-muted-foreground">
                Live
              </Badge>
            </div>
            
            {/* Content area */}
            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1.2fr]">
              {/* File tree */}
              <div className="space-y-1.5 rounded-xl border border-white/[0.06] bg-black/40 p-3 text-left font-mono text-xs text-muted-foreground">
                <p className="text-sky-300/80">src/</p>
                <p className="pl-3">app/</p>
                <p className="pl-3">lib/</p>
                <p className="pl-3">components/</p>
                <div className="mt-3 space-y-1.5">
                  <div className="animate-shimmer h-1.5 rounded bg-white/[0.05]" />
                  <div className="animate-shimmer h-1.5 w-4/5 rounded bg-white/[0.05]" />
                  <div className="animate-shimmer h-1.5 w-3/5 rounded bg-white/[0.05]" />
                </div>
              </div>
              
              {/* Assistant panel */}
              <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#08080a] p-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                  Assistant
                </p>
                <p className="mt-3 min-h-[4rem] text-sm leading-relaxed text-zinc-300">
                  {typed}
                  <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-sky-400 align-middle" />
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {PREVIEW_CAPABILITIES.map(({ icon: Icon, label }) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[10px] text-muted-foreground"
                    >
                      <Icon className="size-3 text-sky-300/80" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
