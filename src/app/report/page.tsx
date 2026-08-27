import { Container } from "@/components/ui/container";
import { ReportForm } from "./ReportForm";

export const dynamic = "force-dynamic";

export default async function ReportPage(
  { searchParams }: { searchParams: Promise<{ listing?: string }> },
) {
  const sp = await searchParams;
  const listingId = sp.listing ?? "";

  return (
    <Container size="sm" className="py-10 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight font-heading">Report a listing</h1>
        <p className="text-muted-foreground">
          Tell us what&apos;s wrong — we&apos;ll review and take action if needed.
        </p>
      </header>
      <ReportForm listingId={listingId} />
    </Container>
  );
}
