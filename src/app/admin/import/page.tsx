import { redirect } from "next/navigation";
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

  const { data: isAdminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!isAdminRow) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <h1 className="text-xl font-semibold">Not authorized</h1>
      </div>
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
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Bulk import listings</h1>
        <p className="mt-1 text-sm text-black/70 dark:text-white/70">
          Paste tab-separated rows (copy-paste directly from Google Sheets).
          They land in the pending queue for review.
        </p>
      </header>

      <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4 text-sm">
        <p className="font-medium">Column order (one row per listing):</p>
        <pre className="mt-2 text-xs overflow-x-auto rounded bg-black/[.04] dark:bg-white/[.05] p-2">
{"name\tcategory_slug\tneighborhood_slug\twhatsapp\tdescription\tverified"}
        </pre>
        <details className="mt-3">
          <summary className="cursor-pointer text-black/70 dark:text-white/70">
            Category slugs
          </summary>
          <ul className="mt-2 grid grid-cols-2 gap-1 text-xs">
            {cats.map((c) => (
              <li key={c.slug}>
                <code>{c.slug}</code> — {c.name}
              </li>
            ))}
          </ul>
        </details>
        <details className="mt-2">
          <summary className="cursor-pointer text-black/70 dark:text-white/70">
            Neighborhood slugs
          </summary>
          <ul className="mt-2 grid grid-cols-2 gap-1 text-xs">
            {hoods.map((h) => (
              <li key={h.slug}>
                <code>{h.slug}</code> — {h.name}
              </li>
            ))}
          </ul>
        </details>
        <p className="mt-3 text-xs text-black/60 dark:text-white/60">
          <code>verified</code>: <code>true</code> if you&apos;ve already
          messaged this WhatsApp and got a response, otherwise <code>false</code>{" "}
          or blank.
        </p>
      </div>

      <ImportForm />
    </div>
  );
}
