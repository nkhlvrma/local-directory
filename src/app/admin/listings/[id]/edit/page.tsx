import { notFound, redirect } from "next/navigation";
import { Container, Heading, Text, Flex } from "@radix-ui/themes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EditForm } from "./EditForm";
import type { WeekHours, FieldDef } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditListingPage(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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

  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, name, description, whatsapp_number, category_id, neighborhood_id, pin_code, photo_url, hours_json, verified, status, fields_values",
    )
    .eq("id", id)
    .maybeSingle();
  if (!listing) notFound();

  const [{ data: cats }, { data: hoods }] = await Promise.all([
    supabase.from("categories").select("id, name, slug, fields_schema").order("name"),
    supabase.from("neighborhoods").select("id, name").order("name"),
  ]);

  type L = {
    id: string;
    name: string;
    description: string | null;
    whatsapp_number: string;
    category_id: string;
    neighborhood_id: string;
    pin_code: string | null;
    photo_url: string | null;
    hours_json: WeekHours | null;
    verified: boolean;
    status: string;
    fields_values: Record<string, string | number | boolean | null> | null;
  };

  return (
    <Container size="2" px="4" py="6">
      <Flex direction="column" gap="4">
        <div>
          <Heading size="5">Edit listing</Heading>
          <Text size="2" color="gray" as="p" mt="1">
            {(listing as L).status.toUpperCase()} · id {(listing as L).id.slice(0, 8)}
          </Text>
        </div>
        <EditForm
          listing={listing as L}
          categories={
            (cats ?? []) as {
              id: string;
              name: string;
              slug: string;
              fields_schema: FieldDef[] | null;
            }[]
          }
          neighborhoods={(hoods ?? []) as { id: string; name: string }[]}
        />
      </Flex>
    </Container>
  );
}
