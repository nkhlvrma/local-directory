import { redirect } from "next/navigation";
import Link from "next/link";
import { Container, Heading, Text, Flex, Card, Grid } from "@radix-ui/themes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
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
    <Container size="3" px="4" py="6">
      <Flex direction="column" gap="4">
        <div>
          <Heading size="5">Leads delivered</Heading>
          <Text as="p" size="2" color="gray" mt="1">
            WhatsApp taps per listing, all-time. Use this when a business asks
            &ldquo;is anyone actually contacting me?&rdquo;
          </Text>
        </div>

        <Grid columns={{ initial: "2", sm: "3" }} gap="3">
          <Card size="2">
            <Text size="6" weight="bold">{totalClicks}</Text>
            <Text as="div" size="1" color="gray">total WhatsApp taps</Text>
          </Card>
          <Card size="2">
            <Text size="6" weight="bold">{rows.length}</Text>
            <Text as="div" size="1" color="gray">approved listings</Text>
          </Card>
        </Grid>

        {rows.length === 0 ? (
          <Text size="2" color="gray">No approved listings yet.</Text>
        ) : (
          <Flex direction="column" gap="2">
            {rows.map((r) => (
              <Card key={r.id} size="2">
                <Flex align="center" justify="between" gap="3">
                  <div style={{ minWidth: 0 }}>
                    <Text weight="medium" as="div">{r.name}</Text>
                    <Text size="1" color="gray" as="div">
                      {r.categories.name} · {r.neighborhoods.name}
                    </Text>
                  </div>
                  <Flex align="center" gap="3">
                    <div style={{ textAlign: "right" }}>
                      <Text size="4" weight="bold" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {r.whatsapp_clicks}
                      </Text>
                      <Text as="div" size="1" color="gray" style={{ textTransform: "uppercase" }}>
                        taps
                      </Text>
                    </div>
                    <Link
                      href={`/${r.neighborhoods.cities.slug}/${r.neighborhoods.slug}/${r.categories.slug}/${r.slug}`}
                      style={{ fontSize: 12 }}
                    >
                      view
                    </Link>
                  </Flex>
                </Flex>
              </Card>
            ))}
          </Flex>
        )}
      </Flex>
    </Container>
  );
}
