"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { WhopCheckoutButton } from "@/components/marketing/whop-checkout-button";
import { DUNAAI_PRICING } from "@/lib/pricing";

function openWhop() {
  if (typeof window === "undefined") return;
  window.open("https://whop.com", "_blank", "noopener,noreferrer");
}

export default function BillingPage() {
  const { data: session } = useSession();
  const email = session?.user?.email ?? null;

  const monthly = process.env.NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY;
  const lifetime = process.env.NEXT_PUBLIC_WHOP_CHECKOUT_LIFETIME;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-semibold tracking-tight text-white">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Current plan: <span className="font-medium text-white">{session?.user?.plan || "Free"}</span>
        </p>
      </motion.div>

      {/* Upgrade card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border border-white/[0.06] bg-black/40 backdrop-blur-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Upgrade your plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <WhopCheckoutButton
              baseUrl={monthly}
              email={email}
              variant="primary"
            >
              Upgrade to Pro ({DUNAAI_PRICING.monthly.label}/mo)
            </WhopCheckoutButton>
            <WhopCheckoutButton
              baseUrl={lifetime}
              email={email}
              variant="secondary"
            >
              Buy Lifetime ({DUNAAI_PRICING.lifetime.label})
            </WhopCheckoutButton>
          </CardContent>
        </Card>
      </motion.div>

      {/* Manage card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="border border-white/[0.06] bg-black/40 backdrop-blur-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Manage subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              type="button"
              onClick={openWhop}
              variant="outline"
              className="w-full rounded-xl border-white/[0.12] bg-white/[0.02]"
            >
              <ExternalLink className="mr-2 size-4" />
              Open Whop Dashboard
            </Button>
            <p className="text-xs text-muted-foreground">
              Use Whop to cancel, update payment methods, or view receipts.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
