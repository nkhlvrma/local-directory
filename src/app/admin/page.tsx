import { redirect } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Download,
  FileUp,
  ListFilter,
  MessageSquareText,
  Search,
} from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminQueue } from "./AdminQueue";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: isAdminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", (user as { id: string }).id)
    .maybeSingle();

  if (!isAdminRow) {
    return (
      <Container size="sm" className="py-8">
        <h1 className="text-xl font-semibold">Not authorized</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account is not in <code>admin_users</code>. Ask an existing admin
          to add you.
        </p>
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

  return (
    <Container size="lg" className="py-8">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-balance">Pending queue</h1>
            <p className="text-sm text-muted-foreground">
              {(pending ?? []).length} awaiting review
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href="/admin/leads">
              <Button variant="outline" size="sm">
                <BarChart3 />Leads
              </Button>
            </Link>
            <Link href="/admin/outreach">
              <Button variant="outline" size="sm">
                <MessageSquareText />Outreach
              </Button>
            </Link>
            <Link href="/admin/insights">
              <Button variant="outline" size="sm">
                <Search />Insights
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button variant="outline" size="sm">
                <ListFilter />Categories
              </Button>
            </Link>
            <Link href="/admin/import">
              <Button variant="outline" size="sm">
                <FileUp />Import
              </Button>
            </Link>
            <Link href="/admin/export?type=listings" download>
              <Button variant="outline" size="sm">
                <Download />Export
              </Button>
            </Link>
          </div>
        </div>

        <AdminQueue
          items={((pending ?? []) as unknown[]).map((p) => {
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
          })}
        />
      </div>
    </Container>
  );
}
