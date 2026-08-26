"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Flex, Text } from "@radix-ui/themes";
import { AnimatedCategoryIcon } from "./AnimatedCategoryIcon";

// Client wrapper that translates card-hover into an animate boolean for
// the icon inside. Server components render CategoryCard as data + link.
export function CategoryCard({
  slug,
  name,
  href,
}: {
  slug: string;
  name: string;
  href: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href={href}
      style={{ textDecoration: "none", color: "inherit" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <div
        style={{
          transform: hover ? "translateY(-2px)" : "translateY(0)",
          transition: "transform 180ms ease",
        }}
      >
        <Card size="2">
          <Flex direction="column" gap="2">
            <span style={{ color: "var(--grass-11)" }}>
              <AnimatedCategoryIcon slug={slug} animating={hover} size={22} />
            </span>
            <Text size="2" weight="medium">
              {name}
            </Text>
          </Flex>
        </Card>
      </div>
    </Link>
  );
}
