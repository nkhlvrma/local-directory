import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SchemaEditor } from "./SchemaEditor";
import type { FieldDef } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
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

  const { data: cats } = await supabase
    .from("categories")
    .select("id, name, slug, fields_schema")
    .order("name");

  return (
    <Container className="py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Categories</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add extra fields for a category (e.g. tiffin needs{" "}
          <em>diet</em> and <em>₹/meal</em>; electricians could have{" "}
          <em>24×7 emergency</em>). Fields you define show on the listing editor
          and the public listing page.
        </p>
      </header>
      <div className="space-y-4">
        {((cats ?? []) as {
          id: string;
          name: string;
          slug: string;
          fields_schema: FieldDef[] | null;
        }[]).map((c) => (
          <SchemaEditor
            key={c.id}
            id={c.id}
            name={c.name}
            slug={c.slug}
            schema={c.fields_schema}
          />
        ))}
      </div>
    </Container>
  );
}
