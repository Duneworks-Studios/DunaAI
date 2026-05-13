"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleAuth, setGoogleAuth] = useState(false);

  useEffect(() => {
    void fetch("/api/config/public")
      .then((r) => r.json())
      .then((j: { googleAuth?: boolean }) => setGoogleAuth(Boolean(j.googleAuth)))
      .catch(() => null);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (res?.error) {
      toast.error("Invalid email or password");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_120%,rgba(56,189,248,0.14),transparent_55%)]" />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-[1] w-full max-w-md"
      >
        <Card className="border-white/[0.1] bg-black/45 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-2xl font-semibold tracking-tight text-white">
              Welcome back
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              DunaAI · Part of Dune Network · Duneworks Studios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {googleAuth ? (
              <div className="space-y-4">
                <GoogleSignInButton callbackUrl={callbackUrl} />
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                  <span className="relative bg-black/50 px-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                    or email
                  </span>
                </div>
              </div>
            ) : null}
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <Input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-white/10 bg-white/[0.03] transition focus-visible:ring-sky-400/40"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Password</label>
                <Input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-white/10 bg-white/[0.03] transition focus-visible:ring-sky-400/40"
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 font-semibold shadow-[0_0_32px_rgba(56,189,248,0.25)] transition hover:brightness-110"
                disabled={loading}
              >
                {loading ? "Signing in…" : "Continue"}
              </Button>
            </form>
            <div className="space-y-3 text-center text-sm text-muted-foreground">
              <Link href="/forgot-password" className="block hover:text-sky-300">
                Forgot password?
              </Link>
              <p>
                No account?{" "}
                <Link href="/signup" className="font-medium text-sky-300 hover:underline">
                  Create one
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
