import { redirect } from "next/navigation";
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
    .eq("user_id", user.id)
    .maybeSingle();

  if (!isAdminRow) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 space-y-2">
        <h1 className="text-xl font-semibold">Not authorized</h1>
        <p className="text-sm text-black/70 dark:text-white/70">
          Your account is not in <code>admin_users</code>. Ask an existing admin
          to add you.
        </p>
      </div>
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
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Pending queue</h1>
          <p className="text-sm text-black/60 dark:text-white/60">
            {pending?.length ?? 0} awaiting review
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <a
            href="/admin/leads"
            className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1.5 text-sm"
          >
            Leads delivered
          </a>
          <a
            href="/admin/outreach"
            className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1.5 text-sm"
          >
            Outreach
          </a>
          <a
            href="/admin/import"
            className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1.5 text-sm"
          >
            Bulk import
          </a>
        </div>
      </header>
      <AdminQueue
        // Server → client boundary: pass plain data only.
        items={((pending ?? []) as unknown[]).map((p) => {
          const row = p as unknown as {
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
    </div>
  );
}
