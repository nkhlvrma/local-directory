import {
  BackpackIcon,
  EraserIcon,
  ScissorsIcon,
  LightningBoltIcon,
  MixerVerticalIcon,
  ReaderIcon,
  GearIcon,
  MagicWandIcon,
  DotFilledIcon,
} from "@radix-ui/react-icons";

// Slug → Radix icon. When the taxonomy grows, add here. Falls back to a
// neutral dot so unknown categories still render.
const MAP: Record<string, React.ComponentType<{ width?: number; height?: number }>> = {
  "tiffin-services": BackpackIcon,
  "home-cleaning": EraserIcon,
  tailors: ScissorsIcon,
  electricians: LightningBoltIcon,
  plumbers: MixerVerticalIcon,
  "tuition-coaching": ReaderIcon,
  "car-bike-repair": GearIcon,
  salons: MagicWandIcon,
};

export function CategoryIcon({
  slug,
  size = 20,
}: {
  slug: string;
  size?: number;
}) {
  const Icon = MAP[slug] ?? DotFilledIcon;
  return <Icon width={size} height={size} />;
}
