// Static Lucide icon — kept for headings on category pages where hover
// animation doesn't fit (single icon next to a heading, no card container).
// The animated version lives in AnimatedCategoryIcon.tsx and is used
// on the home grid.
//
// Renders on the server: resolving the DB icon name through the static
// CATEGORY_ICONS map (rather than <DynamicIcon>, which is client-only and
// carries the whole icon registry) means a listing grid ships no JavaScript
// for its icons at all.

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
import { CATEGORY_ICONS } from "@/lib/category-icons";

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

// Seeded categories store an emoji in `icon` rather than a Lucide name
// (see schema.sql). Anything that isn't a known icon name but is short and
// non-ASCII is shown as-is instead of falling through to the dot.
export function isEmojiIcon(icon?: string | null): icon is string {
  return !!icon && icon.length <= 4 && /\p{Extended_Pictographic}/u.test(icon);
}

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
  const Icon = MAP[slug] ?? CATEGORY_ICONS[icon ?? ""];
  if (Icon) return <Icon size={size} strokeWidth={strokeWidth} />;
  if (isEmojiIcon(icon))
    return (
      <span aria-hidden style={{ fontSize: size, lineHeight: 1 }}>
        {icon}
      </span>
    );
  return <Dot size={size} strokeWidth={strokeWidth} />;
}
