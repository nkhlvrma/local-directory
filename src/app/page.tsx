import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CITY_SLUG } from "@/lib/site";

export const revalidate = 300;

export default async function Home() {
  const supabase = await createSupabaseServerClient();

  const { data: city } = await supabase
    .from("cities")
    .select("id, name, slug")
    .eq("slug", CITY_SLUG)
    .maybeSingle();

  const [{ data: categories }, { data: neighborhoods }] = await Promise.all([
    supabase.from("categories").select("name, slug, icon").order("name"),
    city
      ? supabase
          .from("neighborhoods")
          .select("name, slug")
          .eq("city_id", city.id)
          .order("name")
      : Promise.resolve({ data: [] as { name: string; slug: string }[] }),
  ]);

  if (!city) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-semibold">Setup incomplete</h1>
        <p className="mt-2 text-sm text-black/70 dark:text-white/70">
          No active city found for slug <code>{CITY_SLUG}</code>. Run the
          Supabase schema and set <code>NEXT_PUBLIC_CITY_SLUG</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-10">
      <section>
        <p className="text-sm uppercase tracking-wider text-black/50 dark:text-white/50">
          {city.name}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Find someone nearby.
        </h1>
        <p className="mt-2 text-black/70 dark:text-white/70">
          Every listing is verified. Tap to chat on WhatsApp — no forms, no
          call-backs.
        </p>
      </section>

      <section>
        <h2 className="text-sm font-medium text-black/60 dark:text-white/60">
          Browse by category
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {((categories ?? []) as { slug: string; name: string; icon: string | null }[]).map((c) => (
            <Link
              key={c.slug}
              href={`/${city.slug}/${c.slug}`}
              className="rounded-2xl border border-black/10 dark:border-white/10 p-4 hover:bg-black/[.03] dark:hover:bg-white/[.05]"
            >
              <div className="text-xl">{c.icon ?? "•"}</div>
              <div className="mt-1 text-sm font-medium">{c.name}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-black/60 dark:text-white/60">
          Browse by neighborhood
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {((neighborhoods ?? []) as { slug: string; name: string }[]).map((n) => (
            <Link
              key={n.slug}
              href={`/${city.slug}/n/${n.slug}`}
              className="rounded-full border border-black/10 dark:border-white/10 px-3 py-1.5 text-sm hover:bg-black/[.03] dark:hover:bg-white/[.05]"
            >
              {n.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
