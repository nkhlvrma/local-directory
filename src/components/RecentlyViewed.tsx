"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heading, Grid, Card, Flex, Text, Badge } from "@radix-ui/themes";
import type { RecentEntry } from "./TrackView";

const KEY = "recently-viewed-v1";

export function RecentlyViewed() {
  const [items, setItems] = useState<RecentEntry[] | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setItems(raw ? (JSON.parse(raw) as RecentEntry[]) : []);
    } catch {
      setItems([]);
    }
  }, []);

  if (!items || items.length === 0) return null;
  const shown = items.slice(0, 4);

  return (
    <section>
      <Heading size="3" color="gray" mb="3">
        Recently viewed
      </Heading>
      <Grid columns={{ initial: "1", sm: "2" }} gap="3">
        {shown.map((r) => (
          <Link
            key={r.id}
            href={r.href}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Card size="2">
              <Flex align="center" gap="3">
                {r.photo_url ? (
                  // Plain img so we don't need next.config remote patterns.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.photo_url}
                    alt=""
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      objectFit: "cover",
                    }}
                  />
                ) : null}
                <div style={{ minWidth: 0 }}>
                  <Flex align="center" gap="1">
                    <Text weight="medium" size="2">
                      {r.name}
                    </Text>
                    {r.verified ? (
                      <Badge color="grass" variant="soft" size="1">
                        ✓
                      </Badge>
                    ) : null}
                  </Flex>
                  <Text size="1" color="gray" as="div">
                    {r.category} · {r.neighborhood}
                  </Text>
                </div>
              </Flex>
            </Card>
          </Link>
        ))}
      </Grid>
    </section>
  );
}
