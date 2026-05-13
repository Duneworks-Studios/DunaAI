import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { BetaShell } from "@/components/layout/beta-shell";
import { publicSiteUrl } from "@/lib/public-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DunaAI — AI coding by Duneworks Studios",
    template: "%s · DunaAI",
  },
  description:
    "DunaAI is the premium AI workspace from Duneworks Studios on Dune Network.",
  metadataBase: new URL(publicSiteUrl()),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh bg-background font-sans antialiased`}
      >
        <AppProviders>
          <BetaShell>{children}</BetaShell>
        </AppProviders>
      </body>
    </html>
  );
}
