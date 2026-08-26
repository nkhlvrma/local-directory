import Link from "next/link";
import { Card, Flex, Text, Badge } from "@radix-ui/themes";
import { VerifiedBadge } from "./VerifiedBadge";
import { OpenNowBadge } from "./OpenNowBadge";
import type { WeekHours } from "@/lib/types";

type Props = {
  href: string;
  name: string;
  category?: string | null;
  neighborhood?: string | null;
  description?: string | null;
  verified?: boolean;
  pin?: string | null;
  photo_url?: string | null;
  hours?: WeekHours | null;
};

export function ListingCard({
  href,
  name,
  category,
  neighborhood,
  description,
  verified,
  pin,
  photo_url,
  hours,
}: Props) {
  return (
    <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
      <Card size="2">
        <Flex align="start" gap="3">
          {photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo_url}
              alt=""
              style={{
                width: 72,
                height: 72,
                borderRadius: 10,
                objectFit: "cover",
                flexShrink: 0,
              }}
              loading="lazy"
            />
          ) : null}
          <Flex direction="column" gap="1" style={{ minWidth: 0, flex: 1 }}>
            <Flex align="center" gap="2" wrap="wrap">
              <Text weight="medium">{name}</Text>
              {verified ? <VerifiedBadge /> : null}
              <OpenNowBadge hours={hours ?? null} />
              {pin ? (
                <Badge color="gray" variant="soft">PIN {pin}</Badge>
              ) : null}
            </Flex>
            <Text size="1" color="gray">
              {[category, neighborhood].filter(Boolean).join(" · ")}
            </Text>
            {description ? (
              <Text
                size="2"
                mt="1"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {description}
              </Text>
            ) : null}
          </Flex>
        </Flex>
      </Card>
    </Link>
  );
}
