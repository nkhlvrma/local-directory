import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageCircle, Archive, ExternalLink } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
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
    <Container className="py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Leads delivered</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Every tap on a WhatsApp button is a lead. Use this when a business asks
          &ldquo;is anyone actually contacting me?&rdquo;
        </p>
      </header>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <MessageCircle className="size-4" />
            <span className="text-3xl font-semibold tabular-nums">{totalClicks}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Total WhatsApp taps
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Archive className="size-4" />
            <span className="text-3xl font-semibold tabular-nums">{rows.length}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Live listings
          </div>
        </Card>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No approved listings yet.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <Card key={r.id} className="p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{r.name}</div>
                <div className="text-xs text-muted-foreground">
                  {r.categories.name} · {r.neighborhoods.name}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="font-semibold tabular-nums">
                    {r.whatsapp_clicks}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    taps
                  </div>
                </div>
                <Link
                  href={`/${r.neighborhoods.cities.slug}/${r.neighborhoods.slug}/${r.categories.slug}/${r.slug}`}
                  className="text-xs inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  view <ExternalLink className="size-3" />
                </Link>
                <Link
                  href={`/admin/listings/${r.id}/edit`}
                  className="text-xs underline text-muted-foreground hover:text-foreground"
                >
                  edit
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
