# DunaAI

Production-grade AI workspace by **Duneworks Studios** on **Dune Network**. Next.js 15, Prisma 7, PostgreSQL, Auth.js, **Whop** billing, and a server-only AI engine (no provider strings on the client).

## Quick start

```bash
cd dunaai
cp .env.example .env
# Fill DATABASE_URL, AUTH_SECRET, AUTH_URL, Whop + AI engine variables (see below)
npm install
npx prisma generate
npx prisma db push
npm run db:seed   # optional admin (see seed output)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Default seed admin: `admin@duneworks.local` (password from `SEED_ADMIN_PASSWORD` or the default in `prisma/seed.ts` — change immediately).

## Supabase (your DunaAI database)

1. In Supabase → **Project Settings → Database**, copy the **URI** (use the pooler URL for serverless if you deploy to Vercel).
2. Set `DATABASE_URL` in `.env` (include `?sslmode=require` if required).
3. Run:

```bash
npx prisma db push
# or for migrations in CI:
npx prisma migrate dev --name init
```

## Auth

- **Email/password**: `POST /api/auth/register`, then sign in at `/login`.
- **Google**: set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`. The “Continue with Google” button appears automatically when both are set.
- **JWT sessions** via Auth.js (`session: { strategy: "jwt" }`).
- **Middleware** protects `/dashboard/*` (Edge-safe config in `src/auth.config.ts`; Prisma only in `src/lib/auth.ts`).

Generate `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

Set `AUTH_URL` to your public origin in production (e.g. `https://dunaai.netlify.app`).

## AI engine (server-only)

All inference goes through `POST /api/chat`. Configuration is **only** via environment variables consumed in `src/lib/ai-engine/` (never imported by client components).

Required for inference:

- **`DEEPSEEK_API_KEY`** (recommended) or **`DUNAAI_AI_API_KEY`** — Deepseek API token from [platform.deepseek.com](https://platform.deepseek.com/api_keys).
- **`DUNAAI_AI_ENDPOINT`** — optional if `DEEPSEEK_API_KEY` is set; the app defaults to `https://api.deepseek.com/v1/chat/completions`. Set explicitly for another OpenAI-compatible provider.
- **`DUNAAI_MODEL_CHAT`** — optional; defaults to `deepseek-chat` for **Duna Chat** when unset.
- **`DUNAAI_MODEL_CODING`** — optional; falls back to `DUNAAI_MODEL_CHAT`, then `deepseek-chat`, when unset.

The UI only shows **Duna Chat** and **Duna Coding**; no vendor names are returned from APIs.

## Whop (billing)

1. **Checkout links** (public): set `NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY` and `NEXT_PUBLIC_WHOP_CHECKOUT_LIFETIME` to your Whop checkout URLs. The app opens them from `/pricing` and `/dashboard/billing` and appends `email` when the user is signed in.
2. **Server API**: set `WHOP_API_KEY` (company API key from Whop; the SDK expects `Bearer` prefix and the app adds it if missing).
3. **Webhooks**: in Whop → Developer → **Create Webhook**, URL `https://<your-domain>/api/webhooks/whop`, API version **v1**, enable at least:
   - `membership.activated`
   - `membership.deactivated`
4. Copy the **webhook signing secret** into `WHOP_WEBHOOK_SECRET` (raw secret from Whop; the app base64-encodes it for the Standard Webhooks verifier).
5. **Plan mapping**: set `WHOP_PLAN_ID_LIFETIME` to the Whop **plan id** that should map to DunaAI **Enterprise** (e.g. `plan_nAv9o4mMRgV37`). Any other paid activation maps to **Pro**.

Webhook handler updates `User.plan`, `Subscription`, and `User.whopMemberId` when possible.

## Security

- Security headers in `next.config.ts` (HSTS, frameguard, nosniff, referrer policy, permissions policy).
- `assertSameOrigin` on sensitive POST routes.
- In-memory rate limits (per IP / user); optional **Upstash** when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set.
- Markdown via `react-markdown` + `rehype-sanitize` to reduce XSS from model output.
- Prisma for SQL-safe queries.

## Deploy (Netlify / Vercel)

1. Set all env vars from `.env.example`.
2. Build: `next build` (Prisma client is generated on `npm install` via `postinstall`).
3. Add `DATABASE_URL` (Supabase pooler recommended for serverless).
4. Point Whop webhooks to `https://<your-domain>/api/webhooks/whop`.

## Scripts

| Script        | Description                |
| ------------- | -------------------------- |
| `npm run dev` | Dev server (Turbopack)     |
| `npm run build` / `start` | Production |
| `npm run db:generate` | `prisma generate`    |
| `npm run db:push`   | `prisma db push`     |
| `npm run db:migrate`| `prisma migrate dev` |
| `npm run db:studio` | Prisma Studio        |
| `npm run db:seed`   | Seed admin user      |

## Project layout (high level)

- `src/app` — App Router pages and API routes (`/api/chat`, auth, `/api/webhooks/whop`).
- `src/lib/ai-engine` — Streaming engine (env-driven).
- `src/lib/whop-sdk.ts` — Whop SDK client for webhooks + user lookup.
- `src/lib/auth.ts` — Auth.js + Prisma adapter + credentials provider.
- `src/auth.config.ts` — Edge-safe auth config for middleware.
- `src/components/dashboard` — Chat workspace, markdown, shell.
- `prisma/schema.prisma` — Users, chats, messages, projects, billing, teams, memory, usage.

---

**DunaAI** · Part of Dune Network · Built by Duneworks Studios
