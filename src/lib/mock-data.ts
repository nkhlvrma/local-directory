// In-memory seed used when Supabase env vars are absent. Same shape as the DB.

type Row = Record<string, unknown>;

const cities: Row[] = [
  { id: "c1", name: "Lucknow", slug: "lucknow", active: true },
];

const neighborhoods: Row[] = [
  { id: "n1", city_id: "c1", name: "Gomti Nagar", slug: "gomti-nagar" },
  { id: "n2", city_id: "c1", name: "Hazratganj", slug: "hazratganj" },
  { id: "n3", city_id: "c1", name: "Aliganj", slug: "aliganj" },
  { id: "n4", city_id: "c1", name: "Indira Nagar", slug: "indira-nagar" },
  { id: "n5", city_id: "c1", name: "Alambagh", slug: "alambagh" },
];

// First cell: Tiffin Services. Other categories exist in the schema so the
// browse-by-category taxonomy is complete, but this seed focuses one.
const categories: Row[] = [
  { id: "k1", name: "Tiffin Services", slug: "tiffin-services", icon: "🍱" },
  { id: "k2", name: "Home Cleaning", slug: "home-cleaning", icon: "🧹" },
  { id: "k3", name: "Tailors", slug: "tailors", icon: "🧵" },
  { id: "k4", name: "Electricians", slug: "electricians", icon: "⚡" },
  { id: "k5", name: "Plumbers", slug: "plumbers", icon: "🔧" },
  { id: "k6", name: "Tuition & Coaching", slug: "tuition-coaching", icon: "📚" },
  { id: "k7", name: "Car & Bike Repair", slug: "car-bike-repair", icon: "🔩" },
  { id: "k8", name: "Salons", slug: "salons", icon: "💇" },
];

// Placeholder demo listings so the UI has something to render before you
// import real ones. Replace via /admin/import.
const listings: Row[] = [
  {
    id: "l1",
    name: "Anita's Home Kitchen",
    slug: "anitas-home-kitchen",
    category_id: "k1",
    neighborhood_id: "n1",
    description:
      "Home-cooked North Indian tiffin. Monthly plans, breakfast + dinner. Jain options.",
    whatsapp_number: "+919812345678",
    hours_json: null,
    photo_url: null,
    verified: true,
    status: "approved",
    categories: { name: "Tiffin Services", slug: "tiffin-services" },
    neighborhoods: { name: "Gomti Nagar", slug: "gomti-nagar", city_id: "c1" },
  },
  {
    id: "l2",
    name: "Rasoi Ghar Tiffin",
    slug: "rasoi-ghar-tiffin",
    category_id: "k1",
    neighborhood_id: "n2",
    description: "Ghar ka khaana. Roti-sabzi-dal-chawal, ₹90/meal. Delivers Hazratganj + nearby.",
    whatsapp_number: "+919811111111",
    hours_json: null,
    photo_url: null,
    verified: true,
    status: "approved",
    categories: { name: "Tiffin Services", slug: "tiffin-services" },
    neighborhoods: { name: "Hazratganj", slug: "hazratganj", city_id: "c1" },
  },
  {
    id: "l3",
    name: "Maa Tiffin Service",
    slug: "maa-tiffin-service",
    category_id: "k1",
    neighborhood_id: "n3",
    description: "Simple UP-style home food. Monthly student packages.",
    whatsapp_number: "+919822222222",
    hours_json: null,
    photo_url: null,
    verified: false,
    status: "approved",
    categories: { name: "Tiffin Services", slug: "tiffin-services" },
    neighborhoods: { name: "Aliganj", slug: "aliganj", city_id: "c1" },
  },
  {
    id: "l4",
    name: "Shivani's Kitchen",
    slug: "shivanis-kitchen",
    category_id: "k1",
    neighborhood_id: "n4",
    description:
      "Bengali + North Indian. Weekly menu on WhatsApp. Trial meal available.",
    whatsapp_number: "+919833333333",
    hours_json: null,
    photo_url: null,
    verified: true,
    status: "approved",
    categories: { name: "Tiffin Services", slug: "tiffin-services" },
    neighborhoods: { name: "Indira Nagar", slug: "indira-nagar", city_id: "c1" },
  },
  {
    id: "l5",
    name: "Annapurna Tiffin",
    slug: "annapurna-tiffin",
    category_id: "k1",
    neighborhood_id: "n5",
    description: "Working professionals + hostels. Same-price veg/non-veg thali.",
    whatsapp_number: "+919844444444",
    hours_json: null,
    photo_url: null,
    verified: false,
    status: "approved",
    categories: { name: "Tiffin Services", slug: "tiffin-services" },
    neighborhoods: { name: "Alambagh", slug: "alambagh", city_id: "c1" },
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
