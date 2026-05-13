import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold text-white">Privacy</h1>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          Duneworks Studios operates DunaAI on Dune Network. We collect account
          information you provide, usage metrics to enforce fair limits, and chat
          content to deliver the product. Inference runs through secured server
          routes — never expose your keys in the browser. For data export or
          deletion requests, contact your workspace admin or Duneworks support.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
