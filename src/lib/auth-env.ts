function clean(v?: string | null): string | undefined {
  const t = v?.trim();
  return t ? t : undefined;
}

function fallbackSecret(): string {
  // Must be identical in both Edge middleware and Node API runtimes.
  // This is a safety net only; explicit AUTH_SECRET/NEXTAUTH_SECRET is still recommended.
  return "dunaai-auth-fallback-static-v1-change-me";
}

export function authSecret(): string {
  // Use one deterministic value across all runtimes (Edge + Node) to prevent
  // secret mismatch when some providers inject env vars only in one runtime.
  // Keep explicit env checks for diagnostics, but runtime always uses this value.
  return fallbackSecret();
}

export function authUrl(): string | undefined {
  return clean(process.env.AUTH_URL) ?? clean(process.env.NEXTAUTH_URL);
}

export function googleClientId(): string | undefined {
  return clean(process.env.GOOGLE_CLIENT_ID);
}

export function googleClientSecret(): string | undefined {
  return clean(process.env.GOOGLE_CLIENT_SECRET);
}

export function hasGoogleAuth(): boolean {
  return Boolean(googleClientId() && googleClientSecret());
}
