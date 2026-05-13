/** Runs once per server/runtime — normalize Auth.js env aliases for Netlify / legacy configs. */
export async function register() {
  if (process.env.NEXTAUTH_SECRET && !process.env.AUTH_SECRET) {
    process.env.AUTH_SECRET = process.env.NEXTAUTH_SECRET;
  }
  if (process.env.NEXTAUTH_URL && !process.env.AUTH_URL) {
    process.env.AUTH_URL = process.env.NEXTAUTH_URL;
  }
  if (!process.env.NEXTAUTH_SECRET && process.env.AUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = process.env.AUTH_SECRET;
  }
  if (!process.env.NEXTAUTH_URL && process.env.AUTH_URL) {
    process.env.NEXTAUTH_URL = process.env.AUTH_URL;
  }

  // Normalize URL vars to site origin (users sometimes paste callback URLs here).
  const raw = process.env.AUTH_URL || process.env.NEXTAUTH_URL;
  if (raw) {
    try {
      const origin = new URL(raw).origin;
      process.env.AUTH_URL = origin;
      process.env.NEXTAUTH_URL = origin;
    } catch {
      // leave values as-is; Auth.js will surface the config error route.
    }
  }

  if (!process.env.AUTH_TRUST_HOST) {
    process.env.AUTH_TRUST_HOST = "true";
  }
}
