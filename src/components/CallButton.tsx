import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  listingId: string;
  className?: string;
};

// Secondary contact channel next to WhatsAppButton. Routes through
// /api/call/[id] (mirrors /api/wa/[id]) so we can log a "call_clicked"
// event before handing off to the phone dialer via tel:.
export function CallButton({ listingId, className }: Props) {
  return (
    <Button asChild variant="outline" className={`h-11 min-h-11 px-5 ${className ?? ""}`}>
      <a href={`/api/call/${listingId}`}>
        <Phone className="size-4" />
        Call
      </a>
    </Button>
  );
}
