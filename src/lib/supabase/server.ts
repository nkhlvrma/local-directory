import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createMockSupabaseClient, isMockMode } from "./mock";

export async function createSupabaseServerClient() {
  if (isMockMode()) {
    return createMockSupabaseClient() as unknown as ReturnType<
      typeof createServerClient
    >;
  }
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component; middleware refreshes the session.
          }
        },
      },
    },
  );
}

// Cookie-free anon client. `createSupabaseServerClient` reads cookies(), which
// is illegal inside generateStaticParams / generateMetadata during a static
// build and forces a route dynamic when it isn't. Use this wherever the query
// is public, cacheable data and there is no session to honour: static param
// generation, the sitemap, and the redirect route handlers.
export function createSupabaseStaticClient() {
  if (isMockMode()) {
    return createMockSupabaseClient() as unknown as ReturnType<
      typeof createServerClient
    >;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  ) as unknown as ReturnType<typeof createServerClient>;
}
