// Static Lucide icon — kept for headings on category pages where hover
// animation doesn't fit (single icon next to a heading, no card container).
// The animated version lives in AnimatedCategoryIcon.tsx and is used
// on the home grid.

import {
  UtensilsCrossed,
  Home,
  Scissors,
  Zap,
  Wrench,
  GraduationCap,
  Car,
  Building2,
  Dot,
  type LucideIcon,
} from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";

const MAP: Record<string, LucideIcon> = {
  "tiffin-services": UtensilsCrossed,
  "home-cleaning": Home,
  tailors: Scissors,
  electricians: Zap,
  plumbers: Wrench,
  "tuition-coaching": GraduationCap,
  "car-bike-repair": Car,
  salons: Building2,
};

export function CategoryIcon({
  slug,
  icon,
  size = 22,
  strokeWidth = 1.75,
}: {
  slug: string;
  // DB-stored Lucide icon name (kebab-case), auto-assigned at category
  // creation — see category-icon-picker.ts. Used when the slug isn't one
  // of the hand-picked categories above.
  icon?: string | null;
  size?: number;
  strokeWidth?: number;
}) {
  const Icon = MAP[slug];
  if (Icon) return <Icon size={size} strokeWidth={strokeWidth} />;
  if (icon)
    return (
      <DynamicIcon
        name={icon as IconName}
        size={size}
        strokeWidth={strokeWidth}
        fallback={() => <Dot size={size} strokeWidth={strokeWidth} />}
      />
    );
  return <Dot size={size} strokeWidth={strokeWidth} />;
}
