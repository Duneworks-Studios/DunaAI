import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import authConfig from "@/auth.config";
import { prisma } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
});

const credentials = Credentials({
  id: "credentials",
  name: "Email and password",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    try {
      const parsed = credentialsSchema.safeParse(credentials);
      if (!parsed.success) return null;
      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email.toLowerCase() },
      });
      if (!user?.passwordHash) return null;
      const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
      if (!ok) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.name ?? undefined,
        image: user.image ?? undefined,
        role: user.role,
        plan: user.plan,
        username: user.username ?? undefined,
      };
    } catch {
      return null;
    }
  },
});

function slugBase(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  return base || "duna-user";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [...authConfig.providers, credentials],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      try {
        if (!user.email) return true;
        const email = user.email.toLowerCase();
        const dbUser = await prisma.user.findUnique({ where: { email } });
        if (!dbUser && account?.provider === "google") {
          const base = slugBase(user.name || email.split("@")[0] || email);
          let candidate = base;
          let i = 2;
          while (i < 1000) {
            const found = await prisma.user.findUnique({ where: { username: candidate } });
            if (!found) break;
            candidate = `${base}-${i}`;
            i += 1;
          }
          await prisma.user.create({
            data: {
              email,
              name: user.name ?? null,
              image: user.image ?? null,
              username: candidate,
            },
          });
          return true;
        }
        if (!dbUser) return true;

        const updates: {
          username?: string;
          image?: string | null;
          name?: string | null;
        } = {};

        if (!dbUser.username) {
          const base = slugBase(user.name || email.split("@")[0] || email);
          let candidate = base;
          let i = 2;
          while (i < 1000) {
            const found = await prisma.user.findUnique({ where: { username: candidate } });
            if (!found) break;
            candidate = `${base}-${i}`;
            i += 1;
          }
          updates.username = candidate;
        }
        if (account?.provider === "google") {
          if (!dbUser.image && user.image) updates.image = user.image;
          if (!dbUser.name && user.name) updates.name = user.name;
        }

        if (Object.keys(updates).length) {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: updates,
          });
        }
      } catch {
        // Never block sign-in on optional profile sync.
      }
      return true;
    },
    async jwt(params) {
      let token = params.token;
      if (authConfig.callbacks?.jwt) {
        try {
          token = await authConfig.callbacks.jwt(params);
        } catch {
          token = params.token;
        }
      }
      try {
        const email =
          (
            typeof token?.email === "string" ? token.email : params.user?.email
          )?.toLowerCase();
        if (email) {
          const dbUser = await prisma.user.findUnique({ where: { email } });
          if (dbUser) {
            token.sub = dbUser.id;
            token.role = dbUser.role;
            token.plan = dbUser.plan;
            token.username = dbUser.username ?? undefined;
            if (!token.name && dbUser.name) token.name = dbUser.name;
            if (!token.picture && dbUser.image) token.picture = dbUser.image;
          }
        }
      } catch {
        // Keep existing token when DB lookup is unavailable.
      }
      return token;
    },
    async session(params) {
      let session = params.session;
      if (authConfig.callbacks?.session) {
        try {
          session = await authConfig.callbacks.session(params);
        } catch {
          session = params.session;
        }
      }
      try {
        if (session.user && !session.user.id) {
          const email =
            typeof params.token?.email === "string"
              ? params.token.email.toLowerCase()
              : undefined;
          if (email) {
            const dbUser = await prisma.user.findUnique({ where: { email } });
            if (dbUser) {
              session.user.id = dbUser.id;
              session.user.role = dbUser.role;
              session.user.plan = dbUser.plan;
              session.user.username = dbUser.username ?? undefined;
            }
          }
        }
      } catch {
        // Leave session as-is if lookup fails.
      }
      return session;
    },
  },
});
