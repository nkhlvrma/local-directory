import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CITY_SLUG } from "@/lib/site";
import { SubmitFormSheet } from "./SubmitFormSheet";

// Shared by both entry points into the submit form: the intercepted @modal
// route (sheet drawn over whatever page you clicked "List your business"
// from) and the plain page at /list-your-business that a direct visit or a
// reload falls back to. Both need exactly the same category/neighborhood
// options, so the fetch lives here instead of being spelled out in both
// route files — they now differ only in the route-level config each needs.
export async function ListYourBusinessSheet() {
  const supabase = await createSupabaseServerClient();

  const { data: city } = await supabase
    .from("cities")
    .select("id, name")
    .eq("slug", CITY_SLUG)
    .maybeSingle();

  const [{ data: categories }, { data: neighborhoods }] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    city
      ? supabase
          .from("neighborhoods")
          .select("id, name")
          .eq("city_id", (city as { id: string }).id)
          .order("name")
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  return (
    <SubmitFormSheet
      categories={(categories ?? []) as { id: string; name: string }[]}
      neighborhoods={(neighborhoods ?? []) as { id: string; name: string }[]}
    />
  );
}
