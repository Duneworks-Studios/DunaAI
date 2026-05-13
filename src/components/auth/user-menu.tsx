"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { ChevronDown, LayoutDashboard, LogOut, Settings, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function initials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "U";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

type UserMenuProps = {
  className?: string;
};

export function UserMenu({ className }: UserMenuProps) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const user = session?.user;
  const isReady = status !== "loading";
  const isAuthed = Boolean(user?.id);
  const userInitials = useMemo(() => initials(user?.name, user?.email), [user?.email, user?.name]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onEscape);
    };
  }, []);

  if (!isReady || !isAuthed) return null;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-2 py-1.5 text-left transition hover:border-white/20 hover:bg-white/[0.08]"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="inline-flex size-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-sky-400/30 to-indigo-500/35 text-xs font-semibold text-white">
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={user.name ?? "Profile"} className="h-full w-full object-cover" />
          ) : (
            userInitials
          )}
        </span>
        <span className="hidden max-w-36 flex-col sm:flex">
          <span className="truncate text-xs font-medium text-white">{user?.name ?? "Account"}</span>
          <span className="truncate text-[11px] text-muted-foreground">{user?.email}</span>
        </span>
        <ChevronDown className={cn("size-4 text-muted-foreground transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-black/90 p-1 shadow-2xl backdrop-blur-2xl"
        >
          <Link
            href="/dashboard"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-200 transition hover:bg-white/[0.07]"
          >
            <LayoutDashboard className="size-4 text-sky-300" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-200 transition hover:bg-white/[0.07]"
          >
            <Settings className="size-4 text-sky-300" />
            Settings
          </Link>
          <Link
            href="/dashboard/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-200 transition hover:bg-white/[0.07]"
          >
            <UserCircle2 className="size-4 text-sky-300" />
            Profile
          </Link>
          <div className="my-1 h-px bg-white/10" />
          <Button
            variant="ghost"
            className="h-9 w-full justify-start rounded-lg px-3 text-sm text-rose-200 hover:bg-rose-500/10 hover:text-rose-100"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      ) : null}
    </div>
  );
}
