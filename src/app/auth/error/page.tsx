import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authSecret, authUrl, hasGoogleAuth } from "@/lib/auth-env";

function messageFor(code: string | null): string {
  switch (code) {
    case "Configuration":
      return "Authentication is not fully configured yet. Check NEXTAUTH/AUTH and Google OAuth variables in production.";
    case "AccessDenied":
      return "Access was denied by the identity provider. Try again and confirm account permissions.";
    case "OAuthSignin":
    case "OAuthCallback":
      return "Google sign-in failed to complete. Verify callback URLs and try again.";
    default:
      return "Sign-in failed unexpectedly. Please retry in a few moments.";
  }
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const code = params.error ?? null;
  const url = authUrl();
  const diagnostics = {
    authSecret: Boolean(authSecret()),
    authSecretExplicit: Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
    authUrl: Boolean(url),
    authUrlExplicit: Boolean(process.env.AUTH_URL || process.env.NEXTAUTH_URL),
    google: hasGoogleAuth(),
    callback: url ? `${url}/api/auth/callback/google` : null,
  };

  return (
    <div className="relative flex min-h-[calc(100dvh-52px)] items-center justify-center px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_120%,rgba(56,189,248,0.12),transparent_55%)]" />
      <Card className="w-full max-w-lg border-white/10 bg-black/55 shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertTriangle className="size-5 text-amber-300" />
            Auth Error
          </CardTitle>
          <CardDescription className="text-zinc-300">{messageFor(code)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {code ? (
            <p className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-muted-foreground">
              Error code: <span className="font-mono text-zinc-200">{code}</span>
            </p>
          ) : null}
          <div className="rounded-md border border-white/10 bg-white/[0.02] p-3 text-xs text-muted-foreground">
            <p className="font-medium text-zinc-300">Runtime auth checks</p>
            <ul className="mt-2 space-y-1">
              <li>Secret resolved (with fallback): <span className="text-zinc-200">{String(diagnostics.authSecret)}</span></li>
              <li>Secret explicitly set in env: <span className="text-zinc-200">{String(diagnostics.authSecretExplicit)}</span></li>
              <li>URL resolved: <span className="text-zinc-200">{String(diagnostics.authUrl)}</span></li>
              <li>URL explicitly set in env: <span className="text-zinc-200">{String(diagnostics.authUrlExplicit)}</span></li>
              <li>Google OAuth vars present: <span className="text-zinc-200">{String(diagnostics.google)}</span></li>
              <li>Expected callback: <span className="font-mono text-zinc-200">{diagnostics.callback ?? "(missing AUTH_URL/NEXTAUTH_URL)"}</span></li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500">
              <Link href="/login">
                <RefreshCw className="mr-2 size-4" />
                Retry Sign In
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl border-white/15">
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
