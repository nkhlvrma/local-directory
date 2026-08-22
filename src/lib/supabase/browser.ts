import { createBrowserClient } from "@supabase/ssr";
import { createMockSupabaseClient, isMockMode } from "./mock";

export function createSupabaseBrowserClient() {
  if (isMockMode()) {
    return createMockSupabaseClient() as unknown as ReturnType<
      typeof createBrowserClient
    >;
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
