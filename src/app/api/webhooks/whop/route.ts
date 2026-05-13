import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { Membership } from "@whop/sdk/resources/shared.js";
import { Plan } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { createWhopApiClient, createWhopWebhookClient } from "@/lib/whop-sdk";

function planFromWhopPlanId(planId: string | undefined): Plan {
  const lifetime = process.env.WHOP_PLAN_ID_LIFETIME?.trim();
  if (lifetime && planId === lifetime) return Plan.ENTERPRISE;
  return Plan.PRO;
}

export const runtime = "nodejs";

async function resolveMembershipEmail(m: Membership): Promise<string | null> {
  const normalize = (e: string | null | undefined) =>
    e?.trim().toLowerCase() ?? null;

  const direct = normalize(m.user?.email);
  if (direct) return direct;

  const client = createWhopApiClient();
  if (!client) return null;
  try {
    const full = await client.memberships.retrieve(m.id);
    return normalize(full.user?.email);
  } catch {
    return null;
  }
}

function periodEnd(m: Membership): Date | null {
  const raw = m.renewal_period_end;
  if (!raw) return null;
  const sec = Number(raw);
  if (!Number.isFinite(sec)) return null;
  return new Date(sec * 1000);
}

export async function POST(request: Request) {
  const client = createWhopWebhookClient();
  if (!client) {
    return new NextResponse("Whop webhooks not configured", { status: 503 });
  }

  const raw = await request.text();
  const h = await headers();
  const headerObj = Object.fromEntries(h.entries());

  let event: unknown;
  try {
    event = client.webhooks.unwrap(raw, { headers: headerObj });
  } catch {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const ev = event as { type?: string; data?: Membership };

  try {
    if (ev.type === "membership.activated" && ev.data) {
      const m = ev.data;
      const email = await resolveMembershipEmail(m);
      if (!email) {
        return new NextResponse("OK", { status: 200 });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return new NextResponse("OK", { status: 200 });
      }

      const dunaPlan = planFromWhopPlanId(m.plan?.id);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: dunaPlan,
          whopMemberId: m.member?.id ?? user.whopMemberId,
        },
      });

      await prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          whopMembershipId: m.id,
          whopPlanId: m.plan?.id ?? null,
          status: m.status,
          currentPeriodEnd: periodEnd(m),
          cancelAtPeriodEnd: m.cancel_at_period_end,
        },
        update: {
          whopMembershipId: m.id,
          whopPlanId: m.plan?.id ?? null,
          status: m.status,
          currentPeriodEnd: periodEnd(m),
          cancelAtPeriodEnd: m.cancel_at_period_end,
        },
      });
    }

    if (ev.type === "membership.deactivated" && ev.data) {
      const m = ev.data;
      const email = await resolveMembershipEmail(m);
      if (!email) {
        return new NextResponse("OK", { status: 200 });
      }
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return new NextResponse("OK", { status: 200 });
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { plan: Plan.FREE },
      });
      await prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          whopMembershipId: m.id,
          whopPlanId: m.plan?.id ?? null,
          status: m.status,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        },
        update: {
          whopMembershipId: m.id,
          whopPlanId: m.plan?.id ?? null,
          status: m.status,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: m.cancel_at_period_end,
        },
      });
    }
  } catch {
    return new NextResponse("Handler error", { status: 500 });
  }

  return new NextResponse("OK", { status: 200 });
}
