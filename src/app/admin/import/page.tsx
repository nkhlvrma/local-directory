import { redirect } from "next/navigation";
import {
  Container,
  Heading,
  Text,
  Flex,
  Card,
  Code,
  Grid,
} from "@radix-ui/themes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CITY_SLUG } from "@/lib/site";
import { ImportForm } from "./ImportForm";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
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
      <Container size="1" px="4" py="6">
        <Heading size="5">Not authorized</Heading>
      </Container>
    );
  }

  const { data: city } = await supabase
    .from("cities")
    .select("id")
    .eq("slug", CITY_SLUG)
    .maybeSingle();

  const [{ data: categories }, { data: neighborhoods }] = await Promise.all([
    supabase.from("categories").select("slug, name").order("name"),
    city
      ? supabase
          .from("neighborhoods")
          .select("slug, name")
          .eq("city_id", (city as { id: string }).id)
          .order("name")
      : Promise.resolve({ data: [] as { slug: string; name: string }[] }),
  ]);

  const cats = (categories ?? []) as { slug: string; name: string }[];
  const hoods = (neighborhoods ?? []) as { slug: string; name: string }[];

  return (
    <Container size="3" px="4" py="6">
      <Flex direction="column" gap="4">
        <div>
          <Heading size="5">Bulk import listings</Heading>
          <Text as="p" size="2" color="gray" mt="1">
            Paste tab-separated rows (copy-paste directly from Google Sheets).
            They land in the pending queue for review.
          </Text>
        </div>

        <Card size="2">
          <Flex direction="column" gap="2">
            <Text size="2" weight="medium">Column order:</Text>
            <Code size="2">
              name{"\t"}category_slug{"\t"}neighborhood_slug{"\t"}whatsapp{"\t"}pin{"\t"}description{"\t"}verified
            </Code>
            <Grid columns={{ initial: "1", sm: "2" }} gap="4" mt="2">
              <div>
                <Text size="1" color="gray" weight="medium">Categories</Text>
                <Flex direction="column" gap="1" mt="1">
                  {cats.map((c) => (
                    <Text size="1" key={c.slug}>
                      <Code>{c.slug}</Code> — {c.name}
                    </Text>
                  ))}
                </Flex>
              </div>
              <div>
                <Text size="1" color="gray" weight="medium">Neighborhoods</Text>
                <Flex direction="column" gap="1" mt="1">
                  {hoods.map((h) => (
                    <Text size="1" key={h.slug}>
                      <Code>{h.slug}</Code> — {h.name}
                    </Text>
                  ))}
                </Flex>
              </div>
            </Grid>
            <Text size="1" color="gray" mt="2">
              <Code>pin</Code>: 6-digit Indian PIN (optional).{" "}
              <Code>verified</Code>: <Code>true</Code> if you&apos;ve already
              messaged them and got a response.
            </Text>
          </Flex>
        </Card>

        <ImportForm />
      </Flex>
    </Container>
  );
}
