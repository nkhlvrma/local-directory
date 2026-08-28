import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CITY_SLUG } from "@/lib/site";
import { SubmitFormSheet } from "@/app/list-your-business/SubmitFormSheet";

// Intercepted version of /list-your-business — rendered in the @modal slot
// when navigated to via a client-side Link from elsewhere in the app, so
// the page you were on stays mounted (and visible, dimmed) behind the
// sheet. A direct visit or reload bypasses interception and gets the full
// page at src/app/list-your-business/page.tsx instead. Same data fetch as
// that fallback — this is the only real duplication, everything else
// (the sheet UI, the form) is shared.

export default async function ListYourBusinessModal() {
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
