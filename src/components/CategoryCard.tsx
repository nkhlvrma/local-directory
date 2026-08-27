"use client";

import { useState } from "react";
import Link from "next/link";
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
      <div
        className={`rounded-xl border p-4 flex flex-col gap-3 transition-all duration-150 ${
          hover
            ? "border-primary/40 bg-muted/40"
            : "border-border/70 bg-transparent"
        }`}
      >
        <span
          className={`size-10 rounded-lg flex items-center justify-center transition-colors duration-150 ${
            hover
              ? "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <AnimatedCategoryIcon slug={slug} animating={hover} size={20} />
        </span>
        <span className="text-sm font-semibold leading-tight">{name}</span>
      </div>
    </Link>
  );
}
