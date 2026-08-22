import { ReportForm } from "./ReportForm";

export const dynamic = "force-dynamic";

export default async function ReportPage(
  { searchParams }: { searchParams: Promise<{ listing?: string }> },
) {
  const sp = await searchParams;
  const listingId = sp.listing ?? "";

  return (
    <div className="mx-auto max-w-md px-4 py-8 space-y-4">
      <h1 className="text-xl font-semibold">Report a listing</h1>
      <p className="text-sm text-black/70 dark:text-white/70">
        Tell us what&apos;s wrong. We&apos;ll review and take action if needed.
      </p>
      <ReportForm listingId={listingId} />
    </div>
  );
}
