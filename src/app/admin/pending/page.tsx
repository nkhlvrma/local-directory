import { redirect } from "next/navigation";
import { Inbox } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminQueue } from "../AdminQueue";

export const dynamic = "force-dynamic";

export default async function PendingPage() {
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

  const { data: pending } = await supabase
    .from("listings")
    .select(
      `id, name, description, whatsapp_number, created_at,
       categories!inner ( name ),
       neighborhoods!inner ( name )`,
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const items = ((pending ?? []) as unknown[]).map((p) => {
    const row = p as {
      id: string;
      name: string;
      description: string | null;
      whatsapp_number: string;
      created_at: string;
      categories: { name: string };
      neighborhoods: { name: string };
    };
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      whatsapp_number: row.whatsapp_number,
      created_at: row.created_at,
      category: row.categories.name,
      neighborhood: row.neighborhoods.name,
    };
  });

  return (
    <Container className="py-8 space-y-6">
      <header>
        <div className="flex items-center gap-2">
          <Inbox className="size-5" />
          <h1 className="text-2xl font-semibold">New submissions</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {items.length === 0
            ? "Queue is empty — nothing to review right now."
            : `${items.length} waiting for your review. Approve the ones that look real; reject spam.`}
        </p>
      </header>

      {items.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="mx-auto rounded-full bg-muted p-3 w-fit">
            <Inbox className="size-6 text-muted-foreground" />
          </div>
          <div className="mt-3 font-medium">All caught up</div>
          <p className="text-sm text-muted-foreground mt-1">
            New submissions will appear here. Meanwhile, work through the reach-out queue.
          </p>
        </Card>
      ) : (
        <AdminQueue items={items} />
      )}
    </Container>
  );
}
