import { Container } from "@/components/ui/container";
import { ReportForm } from "./ReportForm";

export const dynamic = "force-dynamic";

export default async function ReportPage(
  { searchParams }: { searchParams: Promise<{ listing?: string }> },
) {
  const sp = await searchParams;
  const listingId = sp.listing ?? "";

  return (
    <Container size="sm" className="py-6 space-y-3">
      <h1 className="text-xl font-semibold">Report a listing</h1>
      <p className="text-sm text-muted-foreground">
        Tell us what&apos;s wrong. We&apos;ll review and take action if needed.
      </p>
      <ReportForm listingId={listingId} />
    </Container>
  );
}
