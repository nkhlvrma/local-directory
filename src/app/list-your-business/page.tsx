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
    <Container size="sm" className="py-10 space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Free listing
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight font-heading">List your business</h1>
        <p className="text-muted-foreground leading-relaxed">
          We review every submission by hand — usually within a day. No fees, no commissions.
        </p>
      </header>
      <SubmitForm
        categories={(categories ?? []) as { id: string; name: string }[]}
        neighborhoods={(neighborhoods ?? []) as { id: string; name: string }[]}
      />
    </Container>
  );
}
