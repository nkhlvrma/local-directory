import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_NAME = "Local Directory";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — verified local businesses on WhatsApp`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "A curated directory of neighborhood shops, services and workers. Chat directly on WhatsApp — no forms, no spam calls.",
  applicationName: SITE_NAME,
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {!process.env.NEXT_PUBLIC_SUPABASE_URL ? (
          <div className="bg-amber-500/15 text-amber-900 dark:text-amber-200 text-xs px-4 py-1.5 text-center">
            Demo mode — using in-memory data. Connect Supabase in{" "}
            <code>.env.local</code> to enable submissions and admin.
          </div>
        ) : null}
        <header className="border-b border-black/5 dark:border-white/10">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold tracking-tight">
              {SITE_NAME}
            </Link>
            <Link
              href="/list-your-business"
              className="text-sm rounded-full bg-foreground text-background px-3 py-1.5"
            >
              List your business
            </Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-black/5 dark:border-white/10 mt-8">
          <div className="mx-auto max-w-3xl px-4 py-6 text-xs text-black/60 dark:text-white/60">
            {SITE_NAME} · community-verified · no spam calls
          </div>
        </footer>
      </body>
    </html>
  );
}
