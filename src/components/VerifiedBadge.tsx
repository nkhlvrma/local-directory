import { Check } from "lucide-react";

export function VerifiedBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium text-primary border border-primary/30 bg-primary/8 rounded-full px-2 py-0.5"
      title="We messaged this WhatsApp and got a response."
    >
      <Check className="size-3" strokeWidth={2.5} />
      Verified
    </span>
  );
}
