import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import Link from "next/link";
import { Plus, Info } from "lucide-react";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import { LocationBar } from "@/components/LocationBar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_NAME = "Local Directory";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const pin = cookieStore.get("pin")?.value ?? "";
  const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
        {isDemo ? (
          <div className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 text-xs text-center py-1.5 px-4 border-b border-amber-200 dark:border-amber-900 flex items-center justify-center gap-1.5">
            <Info className="size-3.5" />
            <span>
              Demo mode — using in-memory data.{" "}
              <Link href="/admin" className="underline font-medium">
                Try admin
              </Link>{" "}
              (no login needed).
            </span>
          </div>
        ) : null}

        <header className="border-b bg-background sticky top-0 z-40">
          <Container className="py-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <Link href="/" className="font-bold text-lg tracking-tight">
                {SITE_NAME}
              </Link>
              <LocationBar initialPin={pin} />
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Link href="/list-your-business">
                <Button size="sm">
                  <Plus className="size-4" />
                  <span className="hidden sm:inline">List your business</span>
                  <span className="sm:hidden">List</span>
                </Button>
              </Link>
            </div>
          </Container>
        </header>

        <main>{children}</main>

        <footer className="border-t mt-12">
          <Container className="py-6 text-xs text-muted-foreground">
            {SITE_NAME} · community-verified · no spam calls
          </Container>
        </footer>

        <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
