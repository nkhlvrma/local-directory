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

  // Mouse events fire on tap in some mobile browsers too (unlike CSS
  // :hover, which Tailwind already gates behind (hover: hover)), so a tap
  // could trigger the icon's hover animation right as the user navigates
  // away. Only react to genuine hover-capable pointers.
  function canHover() {
    return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }

  return (
    <Link
      href={href}
      onMouseEnter={() => canHover() && setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className="block active:scale-[0.98] transition-transform duration-150 ease-out"
    >
      <Card
        size="sm"
        className={`shadow-none ring-0 border transition-[border-color,background-color] duration-150 ease-out ${
          hover ? "border-primary/40 bg-muted/40" : "border-border/70"
        }`}
      >
        <CardContent className="flex flex-col gap-3">
          <span
            className={`size-10 rounded-lg flex items-center justify-center transition-[background-color,color] duration-150 ease-out ${
              hover
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <AnimatedCategoryIcon slug={slug} icon={icon} animating={hover} size={20} />
          </span>
          <span className="text-sm font-semibold leading-tight whitespace-nowrap">{name}</span>
        </CardContent>
      </Card>
    </Link>
  );
}
