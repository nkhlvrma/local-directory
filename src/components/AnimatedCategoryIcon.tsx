"use client";

// Animated Lucide-style icons adapted from lucide-animated.com (MIT, by
// pqoqubbw). We drive the animation from a parent-controlled `animating`
// prop instead of the shipped mouseenter handlers, so hovering anywhere on
// the card triggers the animation (icons are small; a strict icon-only
// hover target would be finicky). Icons the registry didn't ship for our
// categories (utensils-crossed, building-2, scissors, car) are built here
// with Lucide static paths + our own variants.

import { motion, useAnimation, type Variants } from "motion/react";
import { useEffect } from "react";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const SVG_PROPS = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 2,
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
};

function useVariantController(animating: boolean) {
  const controls = useAnimation();
  useEffect(() => {
    controls.start(animating ? "animate" : "normal");
  }, [animating, controls]);
  return controls;
}

type IconProps = { animating: boolean; size?: number };

// ---------------------------------------------------------------------------
// From lucide-animated.com (adapted): house
// ---------------------------------------------------------------------------

const HOUSE_PATH_VARIANTS: Variants = {
  normal: { pathLength: 1, opacity: 1 },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    transition: { duration: 0.6, opacity: { duration: 0.2 } },
  },
};

function HouseIcon({ animating, size = 22 }: IconProps) {
  const controls = useVariantController(animating);
  return (
    <svg width={size} height={size} {...SVG_PROPS}>
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <motion.path
        animate={controls}
        d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"
        variants={HOUSE_PATH_VARIANTS}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// From lucide-animated.com (adapted): zap
// ---------------------------------------------------------------------------

const ZAP_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    transition: { duration: 0.6, opacity: { duration: 0.1 } },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    transition: { duration: 0.6, opacity: { duration: 0.1 } },
  },
};

function ZapIcon({ animating, size = 22 }: IconProps) {
  const controls = useVariantController(animating);
  return (
    <svg width={size} height={size} {...SVG_PROPS}>
      <motion.path
        animate={controls}
        d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
        variants={ZAP_VARIANTS}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// From lucide-animated.com (adapted): wrench (rotate bounce)
// ---------------------------------------------------------------------------

const WRENCH_VARIANTS: Variants = {
  normal: { rotate: 0, transition: { duration: 0.25, ease: "easeOut" } },
  animate: {
    rotate: [0, 12, -14, 4, 0],
    transition: {
      duration: 1.05,
      times: [0, 0.42, 0.68, 0.88, 1],
      ease: "easeInOut",
    },
  },
};

function WrenchIcon({ animating, size = 22 }: IconProps) {
  const controls = useVariantController(animating);
  return (
    <motion.svg
      width={size}
      height={size}
      animate={controls}
      variants={WRENCH_VARIANTS}
      style={{ transformOrigin: "90% 10%", transformBox: "fill-box" }}
      {...SVG_PROPS}
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" />
    </motion.svg>
  );
}

// ---------------------------------------------------------------------------
// From lucide-animated.com (adapted): graduation-cap (cap bob + tassel swing)
// ---------------------------------------------------------------------------

const CAP_VARIANTS: Variants = {
  normal: { rotate: 0, y: 0 },
  animate: {
    y: [0, -2, 0],
    rotate: [0, -2, 2, 0],
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};
const TASSEL_VARIANTS: Variants = {
  normal: { rotate: 0 },
  animate: {
    rotate: [0, 15, -10, 5, 0],
    transition: { duration: 0.8, ease: "easeInOut", delay: 0.1 },
  },
};

function GraduationCapIcon({ animating, size = 22 }: IconProps) {
  const controls = useVariantController(animating);
  return (
    <svg width={size} height={size} {...SVG_PROPS}>
      <motion.g
        animate={controls}
        style={{ transformOrigin: "12px 12px" }}
        variants={CAP_VARIANTS}
      >
        <path d="M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
        <motion.path
          d="M22 10v6"
          style={{ transformBox: "fill-box", transformOrigin: "top center" }}
          variants={TASSEL_VARIANTS}
        />
      </motion.g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Built here (registry didn't ship these categories):
// utensils-crossed — fork & knife scissor apart on hover
// ---------------------------------------------------------------------------

const FORK_VARIANTS: Variants = {
  normal: { rotate: 0, transition: { duration: 0.25 } },
  animate: {
    rotate: [0, -10, 0],
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};
const KNIFE_VARIANTS: Variants = {
  normal: { rotate: 0, transition: { duration: 0.25 } },
  animate: {
    rotate: [0, 10, 0],
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};

function UtensilsCrossedIcon({ animating, size = 22 }: IconProps) {
  const controls = useVariantController(animating);
  return (
    <svg width={size} height={size} {...SVG_PROPS}>
      <motion.path
        animate={controls}
        variants={FORK_VARIANTS}
        style={{ transformOrigin: "12px 12px", transformBox: "view-box" }}
        d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"
      />
      <motion.path
        animate={controls}
        variants={FORK_VARIANTS}
        style={{ transformOrigin: "12px 12px", transformBox: "view-box" }}
        d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"
      />
      <motion.path
        animate={controls}
        variants={KNIFE_VARIANTS}
        style={{ transformOrigin: "12px 12px", transformBox: "view-box" }}
        d="m2.1 21.8 6.4-6.3"
      />
      <motion.path
        animate={controls}
        variants={KNIFE_VARIANTS}
        style={{ transformOrigin: "12px 12px", transformBox: "view-box" }}
        d="m19 5-7 7"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// building-2 — subtle "lift" (translate up + settle)
// ---------------------------------------------------------------------------

const BUILDING_VARIANTS: Variants = {
  normal: { y: 0 },
  animate: {
    y: [0, -3, 0],
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

function Building2Icon({ animating, size = 22 }: IconProps) {
  const controls = useVariantController(animating);
  return (
    <svg width={size} height={size} {...SVG_PROPS}>
      <motion.g animate={controls} variants={BUILDING_VARIANTS}>
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
        <path d="M10 6h4" />
        <path d="M10 10h4" />
        <path d="M10 14h4" />
        <path d="M10 18h4" />
      </motion.g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// scissors — blades snip on hover
// ---------------------------------------------------------------------------

const SCISSORS_TOP_VARIANTS: Variants = {
  normal: { rotate: 0 },
  animate: {
    rotate: [0, -8, 0],
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};
const SCISSORS_BOT_VARIANTS: Variants = {
  normal: { rotate: 0 },
  animate: {
    rotate: [0, 8, 0],
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

function ScissorsIcon({ animating, size = 22 }: IconProps) {
  const controls = useVariantController(animating);
  return (
    <svg width={size} height={size} {...SVG_PROPS}>
      {/* pivot near the middle where blades cross (~11, 11) */}
      <motion.g
        animate={controls}
        variants={SCISSORS_TOP_VARIANTS}
        style={{ transformOrigin: "11px 11px", transformBox: "view-box" }}
      >
        <circle cx="6" cy="6" r="3" />
        <path d="M8.12 8.12 12 12" />
        <path d="M20 4 8.12 15.88" />
      </motion.g>
      <motion.g
        animate={controls}
        variants={SCISSORS_BOT_VARIANTS}
        style={{ transformOrigin: "11px 11px", transformBox: "view-box" }}
      >
        <circle cx="6" cy="18" r="3" />
        <path d="M14.8 14.8 20 20" />
      </motion.g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// car — bounce as if starting up
// ---------------------------------------------------------------------------

const CAR_BODY_VARIANTS: Variants = {
  normal: { y: 0 },
  animate: {
    y: [0, -1.5, 0, -1, 0],
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};
const WHEEL_VARIANTS: Variants = {
  normal: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: { duration: 0.7, ease: "linear" },
  },
};

function CarIcon({ animating, size = 22 }: IconProps) {
  const controls = useVariantController(animating);
  return (
    <svg width={size} height={size} {...SVG_PROPS}>
      <motion.g animate={controls} variants={CAR_BODY_VARIANTS}>
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
        <path d="M14 17H9" />
      </motion.g>
      <motion.circle
        cx="6.5"
        cy="17.5"
        r="2.5"
        animate={controls}
        variants={WHEEL_VARIANTS}
        style={{ transformOrigin: "6.5px 17.5px", transformBox: "view-box" }}
      />
      <motion.circle
        cx="16.5"
        cy="17.5"
        r="2.5"
        animate={controls}
        variants={WHEEL_VARIANTS}
        style={{ transformOrigin: "16.5px 17.5px", transformBox: "view-box" }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Fallback dot
// ---------------------------------------------------------------------------

function DotIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} {...SVG_PROPS}>
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Public wrapper
// ---------------------------------------------------------------------------

const MAP: Record<
  string,
  (props: IconProps) => React.ReactElement
> = {
  "tiffin-services": UtensilsCrossedIcon,
  "home-cleaning": HouseIcon,
  tailors: ScissorsIcon,
  electricians: ZapIcon,
  plumbers: WrenchIcon,
  "tuition-coaching": GraduationCapIcon,
  "car-bike-repair": CarIcon,
  salons: Building2Icon,
};

export function AnimatedCategoryIcon({
  slug,
  animating,
  size = 22,
}: {
  slug: string;
  animating: boolean;
  size?: number;
}) {
  const Icon = MAP[slug];
  if (!Icon) return <DotIcon size={size} />;
  return <Icon animating={animating} size={size} />;
}
