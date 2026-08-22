import { createClient } from "@supabase/supabase-js";
import { createMockSupabaseClient, isMockMode } from "./mock";

// Server-only client that uses the service-role key. NEVER import from a
// client component. Use only inside server actions / route handlers where
// you need to bypass RLS (e.g. inserting a pending listing from the public
// submission form without a signed-in user).
export function createSupabaseAdminClient() {
  if (isMockMode()) {
    return createMockSupabaseClient() as unknown as ReturnType<
      typeof createClient
    >;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
