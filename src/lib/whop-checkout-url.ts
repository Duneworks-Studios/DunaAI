/** Merge Whop checkout URL with optional email prefill (see Whop checkout docs). */
export function whopCheckoutUrl(
  baseUrl: string | undefined,
  email?: string | null,
): string {
  if (!baseUrl?.trim()) return "";
  try {
    const u = new URL(baseUrl.trim());
    if (!/^https?:$/i.test(u.protocol)) return "";
    if (email?.trim()) {
      u.searchParams.set("email", email.trim());
    }
    return u.toString();
  } catch {
    return "";
  }
}
