"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, Code2, Layers, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LandingHero } from "@/components/marketing/landing-hero";

const features = [
  {
    title: "Duna Memory",
    desc: "Persistent project context that travels with your workspace.",
    icon: Brain,
  },
  {
    title: "Coding Studio",
    desc: "Multi-file generation, structure preview, and export as ZIP.",
    icon: Code2,
  },
  {
    title: "Focus Mode",
    desc: "Distraction-free layout tuned for deep work sessions.",
    icon: Layers,
  },
  {
    title: "Instant Deploy",
    desc: "One-click deployment flow with live pipeline visualization.",
    icon: Zap,
  },
];

const faqs = [
  {
    q: "What is DunaAI?",
    a: "DunaAI is the flagship AI workspace from Duneworks Studios on Dune Network — chat, code, and ship faster in one premium surface.",
  },
  {
    q: "Is my data secure?",
    a: "Sessions use modern auth standards, encrypted transport, and strict server-side inference. Provider details never reach your browser.",
  },
  {
    q: "Can I use DunaAI with my team?",
    a: "Team workspaces include shared presence and collaborative AI sessions for distributed squads.",
  },
];

export function Landing() {
  return (
    <main className="flex-1">
      <LandingHero />

      {/* Features section */}
      <section
        id="features"
        className="border-y border-white/[0.04] bg-gradient-to-b from-black/40 via-black/20 to-black/40 py-24 lg:py-32"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Why DunaAI?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A focused toolchain: memory, coding, collaboration, and deployment — orchestrated with calm, cinematic motion.
            </p>
          </div>
          
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ 
                  duration: 0.5, 
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <Card className="group h-full border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:border-sky-500/20 hover:bg-white/[0.04]">
                  <CardHeader className="space-y-3">
                    <div className="flex size-10 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10 transition-transform duration-300 group-hover:scale-105">
                      <f.icon className="size-5 text-sky-300" />
                    </div>
                    <CardTitle className="text-base font-semibold">{f.title}</CardTitle>
                    <CardDescription className="text-sm text-zinc-400">{f.desc}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Trusted velocity
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Teams describe DunaAI as fast, quiet, and obsessively polished.
              </p>
            </div>
            <div className="grid gap-4">
              {["Linear-grade layout", "Cursor-smooth interactions", "Vercel-fast delivery"].map(
                (t, i) => (
                  <motion.div
                    key={t}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.5,
                      delay: i * 0.1,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  >
                    <Card className="border border-white/[0.06] bg-white/[0.02] backdrop-blur-md transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]">
                      <CardContent className="pt-6">
                        <p className="text-sm leading-relaxed text-zinc-200">
                          &ldquo;{t} — DunaAI replaced three tools for our product org.&rdquo;
                        </p>
                        <p className="mt-3 text-xs text-muted-foreground">
                          Design partner {i + 1} · Dune Network
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="border-t border-white/[0.04] bg-gradient-to-b from-black/50 to-black py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Ready to build?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free on DunaAI. Upgrade when you need more power.
          </p>
          <Button
            asChild
            className="mt-8 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-10 py-6 text-base font-semibold shadow-[0_0_40px_rgba(56,189,248,0.2)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(56,189,248,0.35)]"
            size="lg"
          >
            <Link href="/pricing">View pricing</Link>
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            FAQ
          </h2>
          <div className="mt-10 space-y-4">
            {faqs.map((f, i) => (
              <motion.div
                key={f.q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.4,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <Card className="border border-white/[0.06] bg-white/[0.02] text-left backdrop-blur-md transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-base font-semibold">{f.q}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed text-zinc-300">
                      {f.a}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
