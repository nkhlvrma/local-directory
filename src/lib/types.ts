export type ListingStatus = "pending" | "approved" | "rejected" | "removed";
export type ListingSource = "self_serve" | "manual";

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

export type Listing = {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  neighborhood_id: string;
  description: string | null;
  whatsapp_number: string; // E.164, e.g. +919812345678
  hours_json: Record<string, string> | null;
  photo_url: string | null;
  status: ListingStatus;
  source: ListingSource;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
};
