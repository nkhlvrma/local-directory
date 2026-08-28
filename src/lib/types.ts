export type ListingStatus = "pending" | "approved" | "rejected" | "removed";
export type ListingSource = "self_serve" | "manual" | "import";

export type City = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
};

export type Neighborhood = {
  id: string;
  city_id: string;
  name: string;
  slug: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  parent_id: string | null;
};

// { open: "09:00", close: "18:00" } or null (closed that day).
export type DayHours = { open: string; close: string } | null;
export type WeekHours = Partial<Record<
  "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
  DayHours
>>;

export type Listing = {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  neighborhood_id: string;
  description: string | null;
  whatsapp_number: string; // E.164, e.g. +919812345678
  hours_json: WeekHours | null;
  photo_url: string | null;
  verified: boolean;
  pin_code: string | null;
  whatsapp_clicks: number;
  fields_values: Record<string, string | number | boolean | null> | null;
  status: ListingStatus;
  source: ListingSource;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
};

// Category custom fields schema — admin defines per category, listings fill.
export type FieldType = "text" | "number" | "boolean" | "select";
export type FieldDef = {
  key: string;   // stored in listings.fields_values under this key
  label: string;
  type: FieldType;
  options?: string[]; // for select
  help?: string;
};

// The columns every listing *card* needs — grid cards, search results, and
// the "similar listings" rail all render the same summary shape. Kept as a
// single constant (with the row type it produces right beside it, so the
// two can't drift) because four separate page queries previously spelled
// this list out by hand; adding a field to the card meant editing all four.
export const LISTING_CARD_COLUMNS =
  "id, name, slug, description, verified, pin_code, photo_url, hours_json";

// The row shape LISTING_CARD_COLUMNS selects. Pages intersect this with
// whichever relations they additionally join, e.g.
//   type Row = ListingCardRow & { categories: { name: string } };
export type ListingCardRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  verified: boolean;
  pin_code: string | null;
  photo_url: string | null;
  hours_json: WeekHours | null;
};
