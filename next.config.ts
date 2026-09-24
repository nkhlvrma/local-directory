import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Listing photos are stored under timestamped, never-overwritten paths,
    // so an optimized copy never goes stale. The 60s default made Vercel
    // re-fetch and re-optimize them over and over, and optimizations are
    // billed. A new photo gets a new URL, so a long TTL is safe.
    minimumCacheTTL: 60 * 60 * 24 * 31,
    // Listing photos live in Supabase Storage's public bucket URLs, which
    // vary by project ref across environments — match any Supabase project.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    // "radix-ui" is an umbrella package that re-exports every primitive, so
    // importing Tooltip pulled Menubar, Toast and the rest into the same
    // chunk. This rewrites those to per-primitive imports at build time.
    optimizePackageImports: ["radix-ui", "lucide-react"],
    // Listing photo uploads go through server actions (submitListing,
    // createListing) as multipart FormData, and are validated up to 5MB —
    // but Next's default server action body cap is 1MB. Match the two.
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
