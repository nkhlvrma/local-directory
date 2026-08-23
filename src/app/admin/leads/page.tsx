import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
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

  const { data } = await supabase
    .from("listings")
    .select(
      `id, name, slug, whatsapp_clicks, verified,
       categories!inner ( name, slug ),
       neighborhoods!inner ( name, slug, cities!inner ( slug ) )`,
    )
    .eq("status", "approved")
    .order("whatsapp_clicks", { ascending: false })
    .limit(200);

  type Row = {
    id: string;
    name: string;
    slug: string;
    whatsapp_clicks: number;
    verified: boolean;
    categories: { name: string; slug: string };
    neighborhoods: { name: string; slug: string; cities: { slug: string } };
  };
  const rows = ((data ?? []) as unknown as Row[]).filter(Boolean);
  const totalClicks = rows.reduce((s, r) => s + (r.whatsapp_clicks ?? 0), 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Leads delivered</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          WhatsApp taps per listing, all-time. Use this when a business asks
          &ldquo;is anyone actually contacting me?&rdquo;
        </p>
      </header>

      <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4 text-sm flex items-baseline gap-4">
        <div>
          <div className="text-2xl font-semibold">{totalClicks}</div>
          <div className="text-xs text-black/60 dark:text-white/60">
            total WhatsApp taps
          </div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{rows.length}</div>
          <div className="text-xs text-black/60 dark:text-white/60">
            approved listings
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-black/60 dark:text-white/60">
          No approved listings yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-black/10 dark:border-white/10 p-3"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">{r.name}</div>
                <div className="text-xs text-black/60 dark:text-white/60">
                  {r.categories.name} · {r.neighborhoods.name}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="font-semibold tabular-nums">
                    {r.whatsapp_clicks}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-black/50 dark:text-white/50">
                    taps
                  </div>
                </div>
                <Link
                  href={`/${r.neighborhoods.cities.slug}/${r.neighborhoods.slug}/${r.categories.slug}/${r.slug}`}
                  className="text-xs underline text-black/60 dark:text-white/60"
                >
                  view
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
