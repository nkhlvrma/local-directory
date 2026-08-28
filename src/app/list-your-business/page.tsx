import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CITY_SLUG } from "@/lib/site";
import { SubmitFormSheet } from "./SubmitFormSheet";

export const revalidate = 3600;

export default async function ListYourBusinessPage() {
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
