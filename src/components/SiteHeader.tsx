"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { Plus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { HEADER_HEIGHT } from "@/lib/site";

const SITE_NAME = "Local Directory";

// Pages that run artwork to the top of the viewport mark it with
// data-page-hero; this component only needs to know whether such an element
// exists on the current page, so it looks for one rather than maintaining a
// list of routes (which would get the photo-less listing pages wrong).
const HERO_SELECTOR = "[data-page-hero]";

// useLayoutEffect would warn during SSR, where there is no DOM to measure.
const useBrowserLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function SiteHeader() {
  const pathname = usePathname();

  // Transparent white-on-image treatment, but only while the hero is
  // actually behind the header. Once it scrolls past, the header goes solid
  // — otherwise white text sits on the page background, which is invisible
  // in light mode (the homepage had exactly that bug before this).
  const [overHero, setOverHero] = useState(false);

  // Layout effect so the right treatment is in place before the first paint
  // rather than flashing a solid header over the top of the hero.
  useBrowserLayoutEffect(() => {
    const hero = document.querySelector(HERO_SELECTOR);
    setOverHero(!!hero && hero.getBoundingClientRect().bottom > HEADER_HEIGHT);
  }, [pathname]);

  useEffect(() => {
    const hero = document.querySelector(HERO_SELECTOR);
    if (!hero) return;

    let io: IntersectionObserver | undefined;
    // Rebuilt on resize because rootMargin is a fixed pixel value derived
    // from the viewport height — left alone it would go stale the moment the
    // window changed size (or a phone rotated).
    const attach = () => {
      io?.disconnect();
      // An observer rather than a scroll listener: no work on every frame,
      // and it reports the state we actually care about. Collapsing the
      // viewport to just the header strip means the hero "intersects"
      // precisely while some of it is still passing behind the header.
      io = new IntersectionObserver(
        ([entry]) => setOverHero(entry.isIntersecting),
        {
          rootMargin: `0px 0px -${Math.max(0, window.innerHeight - HEADER_HEIGHT)}px 0px`,
        },
      );
      io.observe(hero);
    };

    attach();
    window.addEventListener("resize", attach);
    return () => {
      window.removeEventListener("resize", attach);
      io?.disconnect();
    };
  }, [pathname]);

  const transparent = overHero;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-200",
        transparent
          ? "text-white"
          : "border-b bg-background/95 backdrop-blur-sm",
      )}
    >
      <Container className="py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="flex items-center shrink-0">
            <span className="font-bold text-base tracking-tight">{SITE_NAME}</span>
          </Link>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <ThemeToggle />
          <Link href="/list-your-business">
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">List your business</span>
              <span className="sm:hidden">List</span>
            </Button>
          </Link>
        </div>
      </Container>
    </header>
  );
}
