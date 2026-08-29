import { headers } from "next/headers";
import { SITE_URL } from "@/lib/site";

// The origin the current request actually arrived on.
//
// Used to build the emailed password-recovery link, deliberately in place of
// SITE_URL, because two separate things break when that link points at a
// different host than the admin is browsing:
//
//   - Supabase only follows redirect targets on its configured Site URL or
//     its Redirect URLs allow list, and silently falls back to the Site URL
//     root otherwise — the link "works" but never reaches our callback.
//   - The PKCE code verifier is stored in a cookie scoped to the origin that
//     requested the reset, so a callback on any other host arrives without it
//     and the code exchange fails.
//
// Vercel serves this app on several aliases at once, so a single build-time
// host is wrong for everyone who used a different one. Supabase's allow list
// is what stops a forged Host header from aiming recovery links off-site —
// list exact origins there, never broad wildcards.
export async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return SITE_URL;
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
