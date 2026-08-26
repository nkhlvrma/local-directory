import { redirect } from "next/navigation";
import { Container, Heading, Text, Flex, Card, Badge } from "@radix-ui/themes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SearchInsightsPage() {
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

  const { data: events } = await supabase
    .from("search_events")
    .select("query, matched_count, created_at")
    .eq("matched_count", 0)
    .order("created_at", { ascending: false });

  type Ev = { query: string; matched_count: number; created_at: string };
  const rows = ((events ?? []) as unknown as Ev[]).map((e) => e.query.toLowerCase());

  // Group by query, count occurrences.
  const counts = new Map<string, number>();
  for (const q of rows) counts.set(q, (counts.get(q) ?? 0) + 1);
  const grouped = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <Container size="3" px="4" py="6">
      <Flex direction="column" gap="4">
        <div>
          <Heading size="5">Search insights — zero-result queries</Heading>
          <Text as="p" size="2" color="gray" mt="1">
            What people searched for but found nothing. Every repeated entry
            here is a missing listing you could add.
          </Text>
        </div>
        {grouped.length === 0 ? (
          <Text size="2" color="gray">No zero-result searches yet.</Text>
        ) : (
          <Flex direction="column" gap="2">
            {grouped.map(([q, count]) => (
              <Card key={q} size="2">
                <Flex align="center" justify="between" gap="3">
                  <Text weight="medium">{q}</Text>
                  <Badge color={count > 3 ? "amber" : "gray"} variant="soft">
                    {count} {count === 1 ? "search" : "searches"}
                  </Badge>
                </Flex>
              </Card>
            ))}
          </Flex>
        )}
      </Flex>
    </Container>
  );
}
