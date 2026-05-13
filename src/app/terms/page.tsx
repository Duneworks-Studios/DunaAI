import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

export default function TermsPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold text-white">Terms</h1>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          By using DunaAI you agree to follow applicable laws, respect third-party
          rights, and not misuse the platform. Features may change during beta.
          Billing, if enabled, is processed through Whop according to their terms.
          Duneworks Studios may update these terms with notice in-product.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
