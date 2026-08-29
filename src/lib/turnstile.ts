// Cloudflare Turnstile server-side verifier. Cheap POST to their siteverify
// endpoint. Returns true if the token is valid OR if Turnstile is not
// configured (so local dev / demo mode still work).

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured → skip
  if (!token) return false;

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body: new URLSearchParams({ secret, response: token }),
    });
    const json = (await res.json()) as { success?: boolean };
    return Boolean(json.success);
  } catch {
    // If Cloudflare is unreachable, fail closed — better to bounce a legit
    // submission than to let spam through.
    return false;
  }
}
