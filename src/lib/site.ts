export const SITE_NAME = "Local Directory";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
  "http://localhost:3000";
export const CITY_SLUG = process.env.NEXT_PUBLIC_CITY_SLUG || "lucknow";
export const SITE_NAME_FALLBACK = "this city";

export type CityMap = {
  name: string;
  latitude: number;
  longitude: number;
  zoom: number;
  bounds: [number, number, number, number];
};

// Coordinates used by the map embed. Keep the list small and explicit until
// city configuration moves into the database.
export const CITY_MAPS: Record<string, CityMap> = {
  lucknow: {
    name: "Lucknow",
    latitude: 26.8467,
    longitude: 80.9462,
    zoom: 12,
    bounds: [80.82, 26.76, 81.08, 26.94],
  },
  bangalore: {
    name: "Bangalore",
    latitude: 12.9716,
    longitude: 77.5946,
    zoom: 11,
    bounds: [77.45, 12.85, 77.75, 13.08],
  },
};

// Rendered height of the sticky site header (Container py-3 + a 36px
// icon-sized control). Pages with a full-bleed hero pull it up by this
// amount so the artwork runs to the top of the viewport behind the
// transparent header, rather than starting below it.
export const HEADER_HEIGHT = 60;
