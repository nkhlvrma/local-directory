import { Badge } from "@radix-ui/themes";
import { CheckIcon } from "@radix-ui/react-icons";

export function VerifiedBadge() {
  return (
    <Badge color="grass" variant="soft" title="We messaged this WhatsApp and got a response.">
      <CheckIcon />
      Verified
    </Badge>
  );
}
