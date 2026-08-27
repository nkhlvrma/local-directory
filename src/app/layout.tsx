import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import Link from "next/link";
import { Plus } from "lucide-react";
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
            <div className="bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200 text-xs text-center py-1.5 px-4 border-b border-amber-200 dark:border-amber-900">
              Demo mode — using in-memory data.
            </div>
          ) : null}

          <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-40">
            <Container className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Link href="/" className="flex items-center gap-2 shrink-0">
                  <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
                  <span className="font-bold text-base tracking-tight">{SITE_NAME}</span>
                </Link>
                <LocationBar initialPin={pin} />
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <ThemeToggle />
                <Link href="/list-your-business">
                  <Button size="sm" className="gap-1.5">
                    <Plus className="size-3.5" />
                    <span className="hidden sm:inline">List your business</span>
                    <span className="sm:hidden">List</span>
                  </Button>
                </Link>
              </div>
            </Container>
          </header>

          <main>{children}</main>

          <footer className="border-t mt-16">
            <Container className="py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                  <span className="text-sm font-semibold">{SITE_NAME}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Community-verified · no spam calls · WhatsApp only
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <Link href="/list-your-business" className="hover:text-foreground transition-colors">
                  List your business
                </Link>
                <Link href="/report" className="hover:text-foreground transition-colors">
                  Report a listing
                </Link>
              </div>
            </Container>
          </footer>

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
