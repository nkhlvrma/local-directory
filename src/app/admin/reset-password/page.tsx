import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const dynamic = "force-dynamic";

// Guarded by the session the recovery link established, not by requireAdmin:
// the point of the page is to regain access, so demanding admin membership
// up front would lock out the person it exists for. Arriving without that
// session means the link was never followed (or has lapsed), so send them
// back to request a fresh one.
export default async function AdminResetPasswordPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/forgot-password?error=link_expired");

  return (
    <Container size="sm" className="py-16 space-y-6 max-w-sm mx-auto">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight font-heading">Set a new password</h1>
        <p className="text-muted-foreground text-sm">Signed in as {user.email}.</p>
      </header>
      <ResetPasswordForm />
    </Container>
  );
}
