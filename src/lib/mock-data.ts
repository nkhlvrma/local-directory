// In-memory seed used when Supabase env vars are absent. Same shape as the DB.

type Row = Record<string, unknown>;

const cities: Row[] = [
  { id: "c1", name: "Bangalore", slug: "bangalore", active: true },
];

const neighborhoods: Row[] = [
  { id: "n1", city_id: "c1", name: "Koramangala", slug: "koramangala" },
  { id: "n2", city_id: "c1", name: "Indiranagar", slug: "indiranagar" },
  { id: "n3", city_id: "c1", name: "HSR Layout", slug: "hsr-layout" },
  { id: "n4", city_id: "c1", name: "Jayanagar", slug: "jayanagar" },
];

const categories: Row[] = [
  { id: "k1", name: "Electricians", slug: "electricians", icon: "⚡" },
  { id: "k2", name: "Plumbers", slug: "plumbers", icon: "🔧" },
  { id: "k3", name: "Tiffin Services", slug: "tiffin-services", icon: "🍱" },
  { id: "k4", name: "Tailors", slug: "tailors", icon: "🧵" },
  { id: "k5", name: "Home Cleaning", slug: "home-cleaning", icon: "🧹" },
  { id: "k6", name: "Tuition & Coaching", slug: "tuition-coaching", icon: "📚" },
  { id: "k7", name: "Car & Bike Repair", slug: "car-bike-repair", icon: "🔩" },
  { id: "k8", name: "Salons", slug: "salons", icon: "💇" },
];

// Pre-joined listings — the mock query builder returns these as-is.
const listings: Row[] = [
  {
    id: "l1",
    name: "Ravi Electricals",
    slug: "ravi-electricals",
    category_id: "k1",
    neighborhood_id: "n1",
    description:
      "Neighborhood electrician. Wiring, fans, geysers, MCB, quick call-outs.",
    whatsapp_number: "+919812345678",
    hours_json: null,
    photo_url: null,
    status: "approved",
    categories: { name: "Electricians", slug: "electricians" },
    neighborhoods: { name: "Koramangala", slug: "koramangala", city_id: "c1" },
  },
  {
    id: "l2",
    name: "Anitha Tiffin",
    slug: "anitha-tiffin",
    category_id: "k3",
    neighborhood_id: "n1",
    description:
      "Home-style South Indian tiffins. Monthly meal plans, breakfast + dinner.",
    whatsapp_number: "+919811111111",
    hours_json: null,
    photo_url: null,
    status: "approved",
    categories: { name: "Tiffin Services", slug: "tiffin-services" },
    neighborhoods: { name: "Koramangala", slug: "koramangala", city_id: "c1" },
  },
  {
    id: "l3",
    name: "Kumar Plumbing Works",
    slug: "kumar-plumbing-works",
    category_id: "k2",
    neighborhood_id: "n2",
    description:
      "Leaks, blockages, geyser install. Serves Indiranagar and nearby.",
    whatsapp_number: "+919822222222",
    hours_json: null,
    photo_url: null,
    status: "approved",
    categories: { name: "Plumbers", slug: "plumbers" },
    neighborhoods: { name: "Indiranagar", slug: "indiranagar", city_id: "c1" },
  },
  {
    id: "l4",
    name: "Salma Boutique",
    slug: "salma-boutique",
    category_id: "k4",
    neighborhood_id: "n3",
    description: "Kurtis, blouses, alterations. Home pickup available.",
    whatsapp_number: "+919833333333",
    hours_json: null,
    photo_url: null,
    status: "approved",
    categories: { name: "Tailors", slug: "tailors" },
    neighborhoods: { name: "HSR Layout", slug: "hsr-layout", city_id: "c1" },
  },
  {
    id: "l5",
    name: "Sparkle Home Cleaners",
    slug: "sparkle-home-cleaners",
    category_id: "k5",
    neighborhood_id: "n4",
    description: "Deep cleaning, kitchen, bathroom, sofa shampooing.",
    whatsapp_number: "+919844444444",
    hours_json: null,
    photo_url: null,
    status: "approved",
    categories: { name: "Home Cleaning", slug: "home-cleaning" },
    neighborhoods: { name: "Jayanagar", slug: "jayanagar", city_id: "c1" },
  },
];

export const MOCK_TABLES: Record<string, Row[]> = {
  cities,
  neighborhoods,
  categories,
  listings,
  admin_users: [],
  listing_reports: [],
};
