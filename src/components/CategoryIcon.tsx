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

// Slug → Lucide icon. Add new categories here.
// Fallback is a neutral dot so unknown categories still render.
const MAP: Record<string, LucideIcon> = {
  "tiffin-services": UtensilsCrossed, // food
  "home-cleaning": Home,              // home
  tailors: Scissors,
  electricians: Zap,
  plumbers: Wrench,
  "tuition-coaching": GraduationCap,
  "car-bike-repair": Car,
  salons: Building2,                  // building
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
  // The `data-category-icon` hook is what makes the hover animation fire on
  // cards. Card CSS lives in globals.css.
  return <Icon size={size} strokeWidth={strokeWidth} data-category-icon />;
}
