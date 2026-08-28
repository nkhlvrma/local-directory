import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SITE_NAME } from "@/lib/site";

export const metadata = { title: `Privacy — ${SITE_NAME}` };

export default function PrivacyPage() {
  return (
    <Container size="sm" className="py-10 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight font-heading">Privacy</h1>
        <p className="text-muted-foreground">
          What we collect when you list a business, and what happens to it.
        </p>
      </header>

      <div className="space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-semibold text-base">What we collect</h2>
          <p>
            When you submit a listing, we store the business name, category,
            neighborhood, your WhatsApp number, and anything optional you add
            (PIN code, description). We don&apos;t ask for your real name,
            email, or any ID.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">Who sees it</h2>
          <p>
            {SITE_NAME} is a public directory. Once your listing is approved,
            the business name, category, neighborhood, and WhatsApp number are
            visible to anyone browsing the site — that&apos;s the whole point,
            it&apos;s how customers reach you. We only publish what you submit;
            we don&apos;t sell or share it with anyone else beyond that.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">Before it goes live</h2>
          <p>
            Every submission is reviewed by hand before it&apos;s published —
            nothing goes live automatically. We may verify the WhatsApp
            number is active and belongs to a real, reachable business.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">Removing your listing</h2>
          <p>
            Message us on WhatsApp with the listing link, or use the{" "}
            <Link href="/report" className="underline underline-offset-4 hover:text-primary">
              report a listing
            </Link>{" "}
            form, and we&apos;ll take it down. There&apos;s no account or
            login involved, so this is the way to reach us about your data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">Anonymous usage data</h2>
          <p>
            We log anonymous events — searches, clicks on the WhatsApp/Call
            buttons, page views — to understand what&apos;s useful and improve
            the directory. This isn&apos;t tied to any personal identity.
          </p>
        </section>
      </div>
    </Container>
  );
}
