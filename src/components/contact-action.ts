import { cn } from "@/lib/utils";

// Shared geometry for the listing page's contact controls (WhatsApp, Call,
// Share). They're visually a set — same pill height, same round shape, same
// icon-only collapse — and previously each component restated that, so
// changing the size meant editing three files and hoping none drifted.
// Colour stays with each component, since that's what distinguishes them.
export function contactActionClass(iconOnly?: boolean, className?: string) {
  return cn("rounded-full", iconOnly ? "size-11" : "h-11 px-5", className);
}
