export const SITE_NAME = "Local Directory";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
  "http://localhost:3000";
export const CITY_SLUG = process.env.NEXT_PUBLIC_CITY_SLUG || "bangalore";
