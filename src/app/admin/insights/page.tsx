import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
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

  const { data: events } = await supabase
    .from("search_events")
    .select("query, matched_count, created_at")
    .eq("matched_count", 0)
    .order("created_at", { ascending: false });

  type Ev = { query: string; matched_count: number; created_at: string };
  const rows = ((events ?? []) as unknown as Ev[]).map((e) => e.query.toLowerCase());
  const counts = new Map<string, number>();
  for (const q of rows) counts.set(q, (counts.get(q) ?? 0) + 1);
  const grouped = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <Container className="py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Search insights</h1>
        <p className="text-sm text-muted-foreground mt-1">
          What people typed but found nothing. Every repeat here is a listing
          worth adding.
        </p>
      </header>

      {grouped.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No zero-result searches yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {grouped.map(([q, count]) => (
            <Card key={q} className="p-3 flex items-center justify-between">
              <span className="font-medium">{q}</span>
              <Badge
                variant={count > 3 ? "default" : "secondary"}
                className={count > 3 ? "bg-amber-500 text-white" : ""}
              >
                {count} {count === 1 ? "search" : "searches"}
              </Badge>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
