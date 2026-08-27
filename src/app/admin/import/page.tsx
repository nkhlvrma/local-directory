import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CITY_SLUG } from "@/lib/site";
import { ImportForm } from "./ImportForm";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", (user as { id: string }).id)
    .maybeSingle();
  if (!adminRow) {
    return (
      <Container size="sm" className="py-8">
        <h1 className="text-xl font-semibold">Not authorized</h1>
      </Container>
    );
  }

  const { data: city } = await supabase
    .from("cities")
    .select("id")
    .eq("slug", CITY_SLUG)
    .maybeSingle();

  const [{ data: categories }, { data: neighborhoods }] = await Promise.all([
    supabase.from("categories").select("slug, name").order("name"),
    city
      ? supabase
          .from("neighborhoods")
          .select("slug, name")
          .eq("city_id", (city as { id: string }).id)
          .order("name")
      : Promise.resolve({ data: [] as { slug: string; name: string }[] }),
  ]);

  const cats = (categories ?? []) as { slug: string; name: string }[];
  const hoods = (neighborhoods ?? []) as { slug: string; name: string }[];

  return (
    <Container className="py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Bulk import</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Paste tab-separated rows from Google Sheets. Everything lands in
          <span className="mx-1 font-medium">New submissions</span>
          for you to review.
        </p>
      </header>

      <Card className="p-4">
        <div className="font-medium text-sm mb-2">Column order</div>
        <pre className="overflow-x-auto rounded bg-muted p-2 text-xs">
{"name\tcategory_slug\tneighborhood_slug\twhatsapp\tpin\tdescription\tverified"}
        </pre>
        <div className="grid gap-4 mt-3 grid-cols-1 sm:grid-cols-2">
          <div>
            <div className="text-xs font-medium text-muted-foreground">Categories</div>
            <ul className="text-xs mt-1 space-y-0.5">
              {cats.map((c) => (
                <li key={c.slug}>
                  <code>{c.slug}</code> — {c.name}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Neighborhoods</div>
            <ul className="text-xs mt-1 space-y-0.5">
              {hoods.map((h) => (
                <li key={h.slug}>
                  <code>{h.slug}</code> — {h.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-3">
          <code>pin</code>: 6-digit Indian PIN (optional).{" "}
          <code>verified</code>: <code>true</code> if you already messaged them
          and got a response.
        </div>
      </Card>

      <ImportForm />
    </Container>
  );
}
