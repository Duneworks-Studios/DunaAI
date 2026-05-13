import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { authSecret, googleClientId, googleClientSecret, hasGoogleAuth } from "@/lib/auth-env";

const providers: NextAuthConfig["providers"] = [];

if (hasGoogleAuth()) {
  providers.push(
    Google({
      clientId: googleClientId()!,
      clientSecret: googleClientSecret()!,
      allowDangerousEmailAccountLinking: false,
    }),
  );
}

export default {
  trustHost: true,
  secret: authSecret(),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  providers,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        if (typeof user.id === "string" && user.id) {
          token.sub = user.id;
        }
        const u = user as {
          role?: string;
          plan?: string;
          username?: string | null;
        };
        token.role = u.role ?? "USER";
        token.plan = u.plan ?? "FREE";
        token.username = u.username ?? undefined;
      }
      if (trigger === "update" && session) {
        if (typeof session.name === "string") token.name = session.name;
        if (typeof session.image === "string" || session.image === null) {
          token.picture = session.image ?? undefined;
        }
        if (typeof session.username === "string") {
          token.username = session.username;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (
        session.user &&
        token &&
        typeof token === "object" &&
        typeof token.sub === "string"
      ) {
        session.user.id = token.sub;
        session.user.role =
          typeof token.role === "string" ? token.role : "USER";
        session.user.plan =
          typeof token.plan === "string" ? token.plan : "FREE";
        session.user.username =
          typeof token.username === "string" ? token.username : undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
