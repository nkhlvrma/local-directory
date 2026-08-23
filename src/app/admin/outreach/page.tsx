import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CITY_SLUG } from "@/lib/site";
import { OutreachManager } from "./OutreachManager";

export const dynamic = "force-dynamic";

export default async function OutreachPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: isAdminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!isAdminRow) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <h1 className="text-xl font-semibold">Not authorized</h1>
      </div>
    );
  }

  const { data: city } = await supabase
    .from("cities")
    .select("id")
    .eq("slug", CITY_SLUG)
    .maybeSingle();

  const [{ data: categories }, { data: neighborhoods }, { data: leads }] =
    await Promise.all([
      supabase.from("categories").select("id, slug, name").order("name"),
      city
        ? supabase
            .from("neighborhoods")
            .select("id, slug, name")
            .eq("city_id", (city as { id: string }).id)
            .order("name")
        : Promise.resolve({ data: [] as unknown[] }),
      supabase
        .from("outreach_leads")
        .select(
          `id, business_name, whatsapp_number, source_note, status,
           contacted_at, replied_at, listing_id, created_at,
           categories ( id, slug, name ),
           neighborhoods ( id, slug, name )`,
        )
        .order("created_at", { ascending: false }),
    ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
      <header>
        <h1 className="text-xl font-semibold">Outreach</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          Candidate businesses awaiting a consent message. Only <em>yes</em>{" "}
          replies get promoted to listings.
        </p>
      </header>
      <OutreachManager
        categories={
          (categories ?? []) as { id: string; slug: string; name: string }[]
        }
        neighborhoods={
          (neighborhoods ?? []) as { id: string; slug: string; name: string }[]
        }
        initialLeads={(leads ?? []) as unknown as Lead[]}
      />
    </div>
  );
}

// Shared shape between server and client.
export type Lead = {
  id: string;
  business_name: string;
  whatsapp_number: string;
  source_note: string | null;
  status: "lead" | "contacted" | "yes" | "no" | "no_response";
  contacted_at: string | null;
  replied_at: string | null;
  listing_id: string | null;
  created_at: string;
  categories: { id: string; slug: string; name: string } | null;
  neighborhoods: { id: string; slug: string; name: string } | null;
};
