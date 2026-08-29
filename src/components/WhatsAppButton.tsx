import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  listingId: string;
  className?: string;
  compact?: boolean;
  // Drops the label and renders a round icon button. Opt-in rather than the
  // default because the mobile sticky bar still wants the words — this is
  // for the desktop detail-page action row, where the button sits in a
  // compact cluster beside the listing details.
  iconOnly?: boolean;
};

// Routes through /api/wa/[id] so we can count clicks. The API route
// increments an atomic counter, then 302s to wa.me. Small friction to the
// user (one extra hop), big value for us (we can prove leads to businesses).
// Primary contact CTA — WhatsApp stays first and greenest; Call is secondary.
//
// Built on the shared Button so it inherits the system's focus ring, press
// behaviour and icon spacing; only WhatsApp's brand green is layered on top,
// since that colour isn't (and shouldn't be) a Button variant.
export function WhatsAppButton({ listingId, className, compact, iconOnly }: Props) {
  return (
    <Button
      asChild
      size={iconOnly ? "icon" : "default"}
      className={cn(
        "rounded-full bg-[#25D366] text-white shadow-sm hover:bg-[#25D366] hover:brightness-95",
        iconOnly ? "size-11" : "h-11 px-5",
        className,
      )}
    >
      <a
        href={`/api/wa/${listingId}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={iconOnly ? "Chat on WhatsApp" : undefined}
        title={iconOnly ? "Chat on WhatsApp" : undefined}
      >
        <svg
          aria-hidden="true"
          className="size-5"
          data-icon={iconOnly ? undefined : "inline-start"}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .17 5.33.17 11.9c0 2.1.55 4.15 1.6 5.96L0 24l6.3-1.65a11.9 11.9 0 0 0 5.75 1.47h.01c6.56 0 11.89-5.33 11.89-11.9 0-3.18-1.24-6.17-3.43-8.44ZM12.06 21.3a9.36 9.36 0 0 1-4.77-1.3l-.34-.2-3.74.98 1-3.65-.22-.37a9.4 9.4 0 1 1 8.07 4.54Zm5.4-7.02c-.3-.15-1.75-.87-2.02-.97-.27-.1-.47-.15-.66.15-.2.3-.76.97-.94 1.17-.17.2-.34.22-.63.07-.3-.15-1.24-.46-2.36-1.46a8.83 8.83 0 0 1-1.63-2.02c-.17-.3-.02-.46.13-.6.13-.13.3-.34.44-.5.15-.17.2-.29.3-.49.1-.2.05-.37-.03-.52-.08-.15-.66-1.6-.9-2.19-.24-.58-.48-.5-.66-.5h-.56c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.5s1.07 2.9 1.22 3.1c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.5 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.75-.71 2-1.4.25-.68.25-1.27.17-1.4-.07-.12-.27-.2-.57-.35Z" />
        </svg>
        {iconOnly ? null : compact ? "WhatsApp" : "Chat on WhatsApp"}
      </a>
    </Button>
  );
}
