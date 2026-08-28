"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCategoryIcon } from "./AnimatedCategoryIcon";

export function CategoryCard({
  slug,
  name,
  icon,
  href,
}: {
  slug: string;
  name: string;
  icon?: string | null;
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
        size="sm"
        className={`shadow-none ring-0 border transition-all duration-150 ${
          hover ? "border-primary/40 bg-muted/40" : "border-border/70"
        }`}
      >
        <CardContent className="flex flex-col gap-3">
          <span
            className={`size-10 rounded-lg flex items-center justify-center transition-colors duration-150 ${
              hover
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <AnimatedCategoryIcon slug={slug} icon={icon} animating={hover} size={20} />
          </span>
          <span className="text-sm font-semibold leading-tight">{name}</span>
        </CardContent>
      </Card>
    </Link>
  );
}
