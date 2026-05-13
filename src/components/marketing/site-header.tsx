"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/auth/user-menu";
import { useSession } from "next-auth/react";

const navLinks = [
  { href: "/#features", label: "Features", pathname: "/" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = Boolean(session?.user?.id);

  return (
    <header className="sticky top-[44px] z-40 border-b border-white/[0.04] bg-black/20 backdrop-blur-2xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight text-white transition-colors group-hover:text-sky-200">
            DunaAI
          </span>
          <Badge 
            variant="outline" 
            className="hidden border-white/[0.08] bg-white/[0.02] text-[10px] font-medium text-muted-foreground sm:inline-flex"
          >
            Dune
          </Badge>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const basePath = "pathname" in link ? link.pathname : link.href;
            const isActive = pathname === basePath || pathname.startsWith(basePath + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm transition-colors",
                  isActive ? "text-white" : "text-muted-foreground hover:text-white/80"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-white/[0.06]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {status !== "loading" && isAuthenticated ? (
            <>
              <Button
                asChild
                variant="outline"
                className="hidden border-white/[0.12] bg-white/[0.03] text-sm sm:inline-flex"
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <UserMenu />
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                asChild
                className="hidden text-sm text-muted-foreground transition-colors hover:text-white sm:inline-flex"
              >
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                asChild
                className="relative overflow-hidden rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 text-sm font-medium shadow-[0_0_20px_rgba(56,189,248,0.15)] transition-shadow hover:shadow-[0_0_30px_rgba(56,189,248,0.25)]"
              >
                <Link href="/signup">Start free</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
