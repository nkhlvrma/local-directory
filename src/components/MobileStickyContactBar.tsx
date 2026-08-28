import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CallButton } from "@/components/CallButton";

// Mobile-only sticky contact bar for the listing detail page — same two
// actions as the in-page CTA row (WhatsApp primary, Call secondary), just
// pinned to the bottom of the viewport so they're always reachable on a
// phone without scrolling back up. Hidden on md+ where the in-page CTA is
// already visible without scrolling far.
export function MobileStickyContactBar({ listingId }: { listingId: string }) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t bg-background/95 px-4 pt-3 backdrop-blur-sm md:hidden"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <WhatsAppButton listingId={listingId} className="flex-1 rounded-md" />
      <CallButton listingId={listingId} className="flex-1" />
    </div>
  );
}
