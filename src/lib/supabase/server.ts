import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createMockSupabaseClient, isMockMode } from "./mock";
import { fetchWithTimeout, QUERY_TIMEOUT_MS } from "./fetch";

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
      global: { fetch: fetchWithTimeout(QUERY_TIMEOUT_MS) },
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

// Unwraps a query result on a cached render path, throwing instead of letting
// a failed query read as "no rows". On a prerender that fails the build, so
// the previous deployment stays live; on an ISR revalidation Next keeps
// serving the last good page. Without it, a Supabase blip during a deploy got
// baked into the home page as "Setup incomplete" and into a near-empty sitemap.
export function unwrap<R extends { data: unknown; error: unknown }>(
  res: R,
): Extract<R, { error: null }>["data"] {
  const { data, error } = res;
  if (error) {
    const message = (error as { message?: string }).message ?? String(error);
    throw new Error(`Supabase query failed: ${message}`);
  }
  return data as Extract<R, { error: null }>["data"];
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
    {
      auth: { persistSession: false },
      global: { fetch: fetchWithTimeout(QUERY_TIMEOUT_MS) },
    },
  ) as unknown as ReturnType<typeof createServerClient>;
}
