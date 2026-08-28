import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Roboto_Slab } from "next/font/google";
import Link from "next/link";
import { Plus } from "lucide-react";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { Agentation } from "agentation";

const robotoSlabHeading = Roboto_Slab({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_NAME = "Local Directory";

const DESCRIPTION =
  "A curated directory of neighborhood shops, services and workers. Chat directly on WhatsApp — no forms, no spam calls.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — verified local businesses on WhatsApp`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — verified local businesses on WhatsApp`,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — verified local businesses on WhatsApp`,
    description: DESCRIPTION,
  },
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
  return (
    <html
      lang="en"
      className={cn("antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable, robotoSlabHeading.variable)}
      suppressHydrationWarning
    >
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-dvh flex-col">
          <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-40">
            <Container className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Link href="/" className="flex items-center shrink-0">
                  <span className="font-bold text-base tracking-tight">{SITE_NAME}</span>
                </Link>
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

          <main className="flex-1 min-h-[75dvh]">{children}</main>

          <footer className="border-t mt-16">
            <Container className="py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{SITE_NAME}</span>
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
          </div>
        </ThemeProvider>
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
