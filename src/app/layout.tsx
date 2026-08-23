import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import Link from "next/link";
import { Theme, Container, Flex, Text, Callout, Button } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import { LocationBar } from "@/components/LocationBar";

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

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <Theme accentColor="grass" grayColor="sand" radius="large" scaling="100%">
          <Flex direction="column" style={{ minHeight: "100vh" }}>
            {!process.env.NEXT_PUBLIC_SUPABASE_URL ? (
              <Container size="3" px="4" pt="3">
                <Callout.Root color="amber" size="1">
                  <Callout.Icon>
                    <InfoCircledIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    Demo mode — using in-memory data.{" "}
                    <Link href="/admin" style={{ textDecoration: "underline" }}>
                      Try admin
                    </Link>{" "}
                    (no login needed).
                  </Callout.Text>
                </Callout.Root>
              </Container>
            ) : null}

            <header
              style={{
                borderBottom: "1px solid var(--gray-a4)",
              }}
            >
              <Container size="3" px="4" py="3">
                <Flex align="center" justify="between" gap="3" wrap="wrap">
                  <Flex align="center" gap="3">
                    <Link href="/" style={{ textDecoration: "none" }}>
                      <Text size="4" weight="bold">
                        {SITE_NAME}
                      </Text>
                    </Link>
                    <LocationBar initialPin={pin} />
                  </Flex>
                  <Link href="/list-your-business" style={{ textDecoration: "none" }}>
                    <Button size="2" variant="solid">
                      List your business
                    </Button>
                  </Link>
                </Flex>
              </Container>
            </header>

            <main style={{ flex: 1 }}>{children}</main>

            <footer
              style={{
                borderTop: "1px solid var(--gray-a4)",
                marginTop: "var(--space-6)",
              }}
            >
              <Container size="3" px="4" py="5">
                <Text size="1" color="gray">
                  {SITE_NAME} · community-verified · no spam calls
                </Text>
              </Container>
            </footer>
          </Flex>
        </Theme>
      </body>
    </html>
  );
}
