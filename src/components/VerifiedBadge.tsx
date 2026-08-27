import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export function VerifiedBadge() {
  return (
    <Badge
      variant="secondary"
      className="bg-green-100 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-900 gap-1"
      title="We messaged this WhatsApp and got a response."
    >
      <Check className="size-3" />
      Verified
    </Badge>
  );
}
