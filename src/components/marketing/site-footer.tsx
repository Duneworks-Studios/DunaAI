import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-black/40 py-16">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <p className="text-lg font-semibold text-white">DunaAI</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Part of Dune Network
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Built by Duneworks Studios
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-white">Product</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/pricing" className="hover:text-foreground">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-foreground">
                Dashboard
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium text-white">Legal</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/privacy" className="hover:text-foreground">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-foreground">
                Terms
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium text-white">Connect</p>
          <a
            href="https://github.com"
            className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="size-4" />
            GitHub
          </a>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-7xl px-4 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} Duneworks Studios. All rights reserved.
      </p>
    </footer>
  );
}
