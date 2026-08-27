"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { AnimatedCategoryIcon } from "./AnimatedCategoryIcon";

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
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className="block"
    >
      <Card
        className="p-4 transition-transform hover:bg-muted/50 flex flex-col gap-2"
        style={{ transform: hover ? "translateY(-2px)" : "translateY(0)" }}
      >
        <span className="text-green-700 dark:text-green-400">
          <AnimatedCategoryIcon slug={slug} animating={hover} size={22} />
        </span>
        <span className="text-sm font-medium">{name}</span>
      </Card>
    </Link>
  );
}
