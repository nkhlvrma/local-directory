//
// Fixed-window in-memory rate limiter for the public write endpoints.
// Deliberately dependency-free. The honest caveat: serverless instances don't
// share memory, so the effective ceiling is (limit × warm instances) and a
// cold start resets the window. That is still the difference between "one
// client can write to the database as fast as it can loop" and "a client has
// to work at it" — swap the backing store for Redis/Upstash if abuse becomes
// real. Nothing outside this file needs to change when that happens.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Bound the map so a flood of distinct keys can't grow it without limit.
const MAX_KEYS = 10_000;

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_KEYS) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
      if (buckets.size >= MAX_KEYS) buckets.clear();
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  return {
    ok: existing.count <= limit,
    remaining,
    retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
  };
}

// Best-effort client identity. Vercel sets x-forwarded-for; the first entry is
// the original client. Falls back to a shared bucket rather than throwing —
// an unidentifiable caller should be limited more, not less.
export function clientKey(req: Request, scope: string): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip =
    fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  return `${scope}:${ip}`;
}

// Rejects cross-site POSTs. Same-origin fetches from our own pages always send
// Origin; anything else is either a bot or a different site.
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(req.url).host;
  } catch {
    return false;
  }
}
