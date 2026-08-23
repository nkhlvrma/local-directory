import Link from "next/link";
import { Card, Flex, Text, Badge } from "@radix-ui/themes";
import { VerifiedBadge } from "./VerifiedBadge";

type Props = {
  href: string;
  name: string;
  category?: string | null;
  neighborhood?: string | null;
  description?: string | null;
  verified?: boolean;
  pin?: string | null;
};

export function ListingCard({
  href,
  name,
  category,
  neighborhood,
  description,
  verified,
  pin,
}: Props) {
  return (
    <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
      <Card size="2">
        <Flex direction="column" gap="1">
          <Flex align="center" gap="2" wrap="wrap">
            <Text weight="medium">{name}</Text>
            {verified ? <VerifiedBadge /> : null}
            {pin ? (
              <Badge color="gray" variant="soft">
                PIN {pin}
              </Badge>
            ) : null}
          </Flex>
          <Text size="1" color="gray">
            {[category, neighborhood].filter(Boolean).join(" · ")}
          </Text>
          {description ? (
            <Text size="2" mt="1" style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {description}
            </Text>
          ) : null}
        </Flex>
      </Card>
    </Link>
  );
}
