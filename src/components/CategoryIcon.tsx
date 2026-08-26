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
  size = 22,
  strokeWidth = 1.75,
}: {
  slug: string;
  size?: number;
  strokeWidth?: number;
}) {
  const Icon = MAP[slug] ?? Dot;
  return <Icon size={size} strokeWidth={strokeWidth} />;
}
