import { redirect } from "next/navigation";
import Link from "next/link";
import { Container, Heading, Text, Flex, Button } from "@radix-ui/themes";
import {
  BarChartIcon,
  PaperPlaneIcon,
  UploadIcon,
  MixerHorizontalIcon,
  MagnifyingGlassIcon,
  DownloadIcon,
} from "@radix-ui/react-icons";
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
      <Container size="1" px="4" py="6">
        <Heading size="5">Not authorized</Heading>
        <Text as="p" size="2" color="gray" mt="2">
          Your account is not in <code>admin_users</code>. Ask an existing admin
          to add you.
        </Text>
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
    <Container size="3" px="4" py="6">
      <Flex direction="column" gap="4">
        <Flex align="start" justify="between" gap="3" wrap="wrap">
          <div>
            <Heading size="5">Pending queue</Heading>
            <Text size="2" color="gray">
              {(pending ?? []).length} awaiting review
            </Text>
          </div>
          <Flex gap="2" wrap="wrap">
            <Link href="/admin/leads" style={{ textDecoration: "none" }}>
              <Button variant="soft" size="1"><BarChartIcon />Leads</Button>
            </Link>
            <Link href="/admin/outreach" style={{ textDecoration: "none" }}>
              <Button variant="soft" size="1"><PaperPlaneIcon />Outreach</Button>
            </Link>
            <Link href="/admin/search-insights" style={{ textDecoration: "none" }}>
              <Button variant="soft" size="1"><MagnifyingGlassIcon />Insights</Button>
            </Link>
            <Link href="/admin/categories" style={{ textDecoration: "none" }}>
              <Button variant="soft" size="1"><MixerHorizontalIcon />Categories</Button>
            </Link>
            <Link href="/admin/import" style={{ textDecoration: "none" }}>
              <Button variant="soft" size="1"><UploadIcon />Import</Button>
            </Link>
            <a href="/admin/export?type=listings" style={{ textDecoration: "none" }}>
              <Button variant="soft" size="1"><DownloadIcon />Export</Button>
            </a>
          </Flex>
        </Flex>

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
      </Flex>
    </Container>
  );
}
