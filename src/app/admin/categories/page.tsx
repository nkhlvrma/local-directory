import { Container } from "@/components/ui/container";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CategoryIcon } from "@/components/CategoryIcon";
import { AdminShell } from "../AdminShell";
import { CategoryForm } from "./CategoryForm";
import { CategoryFieldsEditor } from "./CategoryFieldsEditor";
import type { FieldDef } from "@/lib/types";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  fields_schema: FieldDef[] | null;
};

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const admin = createSupabaseAdminClient();

  const { data } = await admin
    .from("categories")
    .select("id, name, slug, icon, fields_schema")
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
            <details key={c.id} className="group border rounded-lg">
              <summary className="p-3 flex items-center gap-3 cursor-pointer list-none">
                <span className="text-muted-foreground">
                  <CategoryIcon slug={c.slug} icon={c.icon} size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.slug}</p>
                </div>
                <span className="text-xs text-muted-foreground group-open:hidden">
                  {c.fields_schema?.length
                    ? `${c.fields_schema.length} field${c.fields_schema.length === 1 ? "" : "s"}`
                    : "Add fields"}
                </span>
              </summary>
              <div className="border-t p-3">
                <CategoryFieldsEditor categoryId={c.id} initial={c.fields_schema} />
              </div>
            </details>
          ))}
        </div>
      </section>
    </Container>
    </AdminShell>
  );
}
