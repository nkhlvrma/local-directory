"use client";

import { useEffect, useState, type ComponentType } from "react";
import { CategoryIcon } from "./CategoryIcon";

// The animated icons are built on Motion (~41 KB gzipped) for hover effects
// nobody sees until they hover — so paying for it in the first load of every
// grid page is backwards. This renders the plain Lucide icon (same shapes,
// zero extra JS) and fetches the animated set the first time an icon is
// actually asked to animate.
//
// The import resolves in well under the time it takes to move a mouse to a
// second card, so in practice only the very first hover is static. The
// module is cached at module scope, so later cards swap in immediately.

type Props = {
  slug: string;
  icon?: string | null;
  animating: boolean;
  size?: number;
};

let loaded: ComponentType<Props> | null = null;

export function AnimatedCategoryIconLazy({
  slug,
  icon,
  animating,
  size = 22,
}: Props) {
  const [Animated, setAnimated] = useState<ComponentType<Props> | null>(loaded);

  useEffect(() => {
    if (Animated || !animating) return;
    let active = true;
    void import("./AnimatedCategoryIcon").then((mod) => {
      loaded = mod.AnimatedCategoryIcon;
      if (active) setAnimated(() => mod.AnimatedCategoryIcon);
    });
    return () => {
      active = false;
    };
  }, [Animated, animating]);

  if (Animated)
    return (
      <Animated slug={slug} icon={icon} animating={animating} size={size} />
    );
  // strokeWidth 2 matches the animated icons' SVG_PROPS, so the swap is
  // invisible.
  return <CategoryIcon slug={slug} icon={icon} size={size} strokeWidth={2} />;
}
