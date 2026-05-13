"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  FolderOpen,
  Home,
  MessageSquare,
  Settings,
  Sparkles,
  Code2,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/auth/user-menu";

const links = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard/studio", label: "Coding Studio", icon: Code2 },
  { href: "/dashboard/files", label: "Files", icon: FolderOpen },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const currentSection =
    links.find((link) => (link.href === "/dashboard" ? pathname === link.href : pathname.startsWith(link.href)))
      ?.label ?? "Workspace";

  return (
    <div className="flex min-h-dvh flex-1 bg-gradient-to-b from-black/40 via-black/20 to-black/30">
      <aside className="hidden w-72 shrink-0 border-r border-white/[0.06] bg-black/55 px-4 py-5 backdrop-blur-2xl lg:flex lg:flex-col">
        <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
          <span className="inline-flex size-8 items-center justify-center rounded-lg border border-sky-400/25 bg-sky-500/10">
            <Sparkles className="size-4 text-sky-300" />
          </span>
          <span className="font-semibold tracking-tight text-white">DunaAI Workspace</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1.5">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === href
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition",
                  active
                    ? "text-white"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="dashboard-nav"
                    className="absolute inset-0 rounded-xl border border-sky-400/20 bg-gradient-to-r from-sky-500/15 to-indigo-500/10 shadow-[0_0_20px_rgba(56,189,248,0.12)]"
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  />
                ) : null}
                <Icon className="relative z-[1] size-4" />
                <span className="relative z-[1]">{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-muted-foreground">
          Premium AI workspace with persistent chat history, coding studio, and account controls.
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-[44px] z-30 border-b border-white/[0.06] bg-black/50 backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Dashboard</p>
              <h1 className="text-sm font-semibold text-white">{currentSection}</h1>
            </div>
            <UserMenu />
          </div>
          <div className="flex gap-1 overflow-x-auto px-2 pb-2 lg:hidden">
            {links.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/dashboard"
                  ? pathname === href
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs transition",
                    active
                      ? "bg-gradient-to-r from-sky-500/20 to-indigo-500/15 text-white"
                      : "text-muted-foreground hover:bg-white/[0.04]",
                  )}
                >
                  <Icon className="size-3.5" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
