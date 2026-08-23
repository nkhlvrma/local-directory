import { Container, Heading, Text, Flex } from "@radix-ui/themes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CITY_SLUG } from "@/lib/site";
import { SubmitForm } from "./SubmitForm";

export const revalidate = 3600;

export default async function ListYourBusinessPage() {
  const supabase = await createSupabaseServerClient();

  const { data: city } = await supabase
    .from("cities")
    .select("id, name")
    .eq("slug", CITY_SLUG)
    .maybeSingle();

  const [{ data: categories }, { data: neighborhoods }] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    city
      ? supabase
          .from("neighborhoods")
          .select("id, name")
          .eq("city_id", (city as { id: string }).id)
          .order("name")
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  return (
    <Container size="2" px="4" py="6">
      <Flex direction="column" gap="4">
        <header>
          <Heading size="6">List your business</Heading>
          <Text as="p" size="2" color="gray" mt="1">
            Free. We review every submission by hand — usually within a day.
          </Text>
        </header>
        <SubmitForm
          categories={(categories ?? []) as { id: string; name: string }[]}
          neighborhoods={(neighborhoods ?? []) as { id: string; name: string }[]}
        />
      </Flex>
    </Container>
  );
}
