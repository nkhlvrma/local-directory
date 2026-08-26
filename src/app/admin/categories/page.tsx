import { redirect } from "next/navigation";
import { Container, Heading, Text, Flex } from "@radix-ui/themes";
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
      <Container size="1" px="4" py="6">
        <Heading size="5">Not authorized</Heading>
      </Container>
    );
  }

  const { data: cats } = await supabase
    .from("categories")
    .select("id, name, slug, fields_schema")
    .order("name");

  return (
    <Container size="3" px="4" py="6">
      <Flex direction="column" gap="4">
        <div>
          <Heading size="5">Categories — custom fields</Heading>
          <Text as="p" size="2" color="gray" mt="1">
            Define per-category fields that appear on the listing editor and the
            public listing page. Store as JSON:{" "}
            <code>[{'{ "key": "diet", "label": "Diet", "type": "select", "options": ["Veg","Non-veg"] }'}]</code>
          </Text>
        </div>
        <Flex direction="column" gap="3">
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
        </Flex>
      </Flex>
    </Container>
  );
}
