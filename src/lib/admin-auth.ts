import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Every /admin page (except /admin/login) calls this first. Redirects to
// login if there's no session, or back to login with an error if the
// signed-in user isn't in admin_users. Uses the service-role client for the
// admin_users check since RLS on that table only allows admins to read it —
// which would otherwise block checking whether someone IS an admin.
export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) redirect("/admin/login?error=not_admin");

  return user;
}
