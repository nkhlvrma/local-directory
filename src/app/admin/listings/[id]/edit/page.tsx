import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      <Container size="sm" className="py-8">
        <h1 className="text-xl font-semibold">Not authorized</h1>
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
    <Container size="sm" className="py-8 space-y-4">
      <div>
        <Link href="/admin/pending">
          <Button variant="ghost" size="sm" className="-ml-2 mb-1">
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-semibold">Edit listing</h1>
          <Badge variant="secondary">{(listing as L).status}</Badge>
        </div>
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
    </Container>
  );
}
