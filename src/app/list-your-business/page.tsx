import { Container } from "@/components/ui/container";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CITY_SLUG } from "@/lib/site";
import { SubmitForm } from "./SubmitForm";

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
    <Container size="sm" className="py-8 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">List your business</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Free. We review every submission by hand — usually within a day.
        </p>
      </div>
      <SubmitForm
        categories={(categories ?? []) as { id: string; name: string }[]}
        neighborhoods={(neighborhoods ?? []) as { id: string; name: string }[]}
      />
    </Container>
  );
}
