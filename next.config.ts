import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
    // Listing photo uploads go through server actions (submitListing,
    // createListing) as multipart FormData, and are validated up to 5MB —
    // but Next's default server action body cap is 1MB. Match the two.
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
