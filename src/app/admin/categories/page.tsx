import { Container } from "@/components/ui/container";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CategoryIcon } from "@/components/CategoryIcon";
import { AdminShell } from "../AdminShell";
import { CategoryForm } from "./CategoryForm";

export const dynamic = "force-dynamic";

type Row = { id: string; name: string; slug: string; icon: string | null };

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const admin = createSupabaseAdminClient();

  const { data } = await admin
    .from("categories")
    .select("id, name, slug, icon")
    .order("name");
  const categories = (data ?? []) as Row[];

  return (
    <AdminShell title="Admin Dashboard" description="Manage the category taxonomy.">
    <Container size="md" className="py-8 space-y-8">
      <CategoryForm />

      <section className="space-y-3">
        <h2 className="font-semibold">
          Categories <span className="text-muted-foreground font-normal">({categories.length})</span>
        </h2>
        <div className="space-y-2">
          {categories.map((c) => (
            <div key={c.id} className="border rounded-lg p-3 flex items-center gap-3">
              <span className="text-muted-foreground">
                <CategoryIcon slug={c.slug} icon={c.icon} size={20} />
              </span>
              <div className="min-w-0">
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-muted-foreground">{c.slug}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Container>
    </AdminShell>
  );
}
