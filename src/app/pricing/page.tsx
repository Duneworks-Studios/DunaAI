"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { WhopCheckoutButton } from "@/components/marketing/whop-checkout-button";
import { DUNAAI_PRICING } from "@/lib/pricing";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "",
    desc: "Individuals exploring DunaAI.",
    features: ["Daily usage caps", "Chat + Studio access", "Community support"],
    cta: { kind: "signup" },
  },
  {
    name: "Pro",
    price: DUNAAI_PRICING.monthly.label,
    period: "/month",
    desc: "Full workspace with higher limits.",
    features: [
      "Higher daily limits",
      "Whop-managed billing",
      "Priority routing",
      "Team-ready workspaces",
    ],
    highlight: true,
    cta: { kind: "whop", interval: "monthly" },
  },
  {
    name: "Lifetime",
    price: DUNAAI_PRICING.lifetime.label,
    period: "one-time",
    desc: "Pay once, keep access forever.",
    features: ["Long-term access", "Whop checkout", "Email support"],
    cta: { kind: "whop", interval: "lifetime" },
  },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const email = session?.user?.email ?? null;
  const monthly = process.env.NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY;
  const lifetime = process.env.NEXT_PUBLIC_WHOP_CHECKOUT_LIFETIME;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      
      <main className="flex-1 px-4 py-16 sm:px-6 lg:py-20">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Simple pricing
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Start free, upgrade when you&apos;re ready. Pro is {DUNAAI_PRICING.monthly.label}/month or {DUNAAI_PRICING.lifetime.label} lifetime.
            </p>
          </motion.div>
        </div>

        {/* Pricing cards */}
        <div className="mx-auto mt-14 max-w-6xl">
          <div className="grid gap-5 lg:grid-cols-3">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <Card
                  className={`
                    relative h-full overflow-hidden border bg-black/40 backdrop-blur-xl
                    ${tier.highlight 
                      ? "border-sky-500/30 shadow-[0_0_40px_rgba(56,189,248,0.1)]" 
                      : "border-white/[0.06]"
                    }
                  `}
                >
                  {/* Popular badge */}
                  {tier.highlight && (
                    <div className="absolute right-4 top-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2.5 py-1 text-[10px] font-medium text-sky-300">
                        <Sparkles className="size-3" />
                        Popular
                      </span>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-white">
                      {tier.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{tier.desc}</p>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-3xl font-semibold text-white">{tier.price}</span>
                      {tier.period && (
                        <span className="text-sm text-muted-foreground">· {tier.period}</span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm text-zinc-300">
                          <Check className="mt-0.5 size-4 shrink-0 text-sky-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* CTA - ALWAYS clickable, no overlays */}
                    <div className="relative z-10 pt-2">
                      {tier.cta.kind === "signup" ? (
                        <Button
                          asChild
                          variant="outline"
                          className="w-full rounded-xl border-white/[0.12] bg-white/[0.02] py-3 text-sm font-medium transition-all hover:border-white/20 hover:bg-white/[0.05]"
                        >
                          <Link href="/signup">Start free</Link>
                        </Button>
                      ) : tier.cta.interval === "monthly" ? (
                        <WhopCheckoutButton
                          baseUrl={monthly}
                          email={email}
                          variant="primary"
                          className="py-3"
                        >
                          Get Pro
                        </WhopCheckoutButton>
                      ) : (
                        <WhopCheckoutButton
                          baseUrl={lifetime}
                          email={email}
                          variant="secondary"
                          className="py-3"
                        >
                          Buy Lifetime
                        </WhopCheckoutButton>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trust note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mx-auto mt-12 max-w-lg text-center text-xs text-muted-foreground"
        >
          All payments are processed securely through Whop. You can manage or cancel your
          subscription anytime from your Whop dashboard.
        </motion.p>
      </main>
      
      <SiteFooter />
    </div>
  );
}
