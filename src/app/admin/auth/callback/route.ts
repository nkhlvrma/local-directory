import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Landing point for the emailed recovery link. Supabase sends the user here
// with a one-time code; exchanging it establishes the short-lived session
// that /admin/reset-password needs in order to call updateUser.
//
// `next` is validated as a same-site absolute path rather than trusted: it
// arrives in the URL, so echoing it into a redirect unchecked would make
// this an open redirect that borrows the trust of the login flow.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/admin/reset-password";
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/admin/reset-password";

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/forgot-password?error=link_invalid`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    // Recovery links are single-use and time-limited, so a failure here is
    // usually an expired or already-used link rather than a real fault.
    return NextResponse.redirect(`${origin}/admin/forgot-password?error=link_expired`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
