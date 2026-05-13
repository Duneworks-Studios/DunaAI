/** Canonical site URL for metadata, emails, and OAuth (no trailing slash). */
export function publicSiteUrl(): string {
  const raw =
    process.env.AUTH_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}
