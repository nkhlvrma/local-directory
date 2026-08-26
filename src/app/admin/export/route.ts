import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// CSV export of all listings. Admin-gated. Returns a downloadable file.

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", (user as { id: string }).id)
    .maybeSingle();
  if (!adminRow)
    return NextResponse.json({ error: "not an admin" }, { status: 403 });

  const url = new URL(req.url);
  const target = url.searchParams.get("type") ?? "listings";

  if (target === "outreach") {
    const { data } = await supabase
      .from("outreach_leads")
      .select("id, business_name, whatsapp_number, source_note, status, contacted_at, replied_at, created_at");
    const csv = toCsv(
      ["id", "business_name", "whatsapp_number", "source_note", "status", "contacted_at", "replied_at", "created_at"],
      (data ?? []) as Record<string, unknown>[],
    );
    return csvResponse(csv, "outreach.csv");
  }

  const { data } = await supabase
    .from("listings")
    .select("id, name, slug, whatsapp_number, pin_code, verified, status, whatsapp_clicks, created_at");
  const csv = toCsv(
    ["id", "name", "slug", "whatsapp_number", "pin_code", "verified", "status", "whatsapp_clicks", "created_at"],
    (data ?? []) as Record<string, unknown>[],
  );
  return csvResponse(csv, "listings.csv");
}

function toCsv(headers: string[], rows: Record<string, unknown>[]): string {
  const escape = (v: unknown) => {
    if (v == null) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const r of rows) lines.push(headers.map((h) => escape(r[h])).join(","));
  return lines.join("\n");
}

function csvResponse(csv: string, filename: string) {
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
