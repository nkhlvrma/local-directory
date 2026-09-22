import { describe, it, expect, afterEach, vi } from "vitest";
import { rateLimit, isSameOrigin, clientKey } from "../rate-limit";

afterEach(() => {
  vi.useRealTimers();
});

describe("rateLimit", () => {
  it("allows up to the limit then rejects", () => {
    const key = `k-${Math.random()}`;
    const opts = { limit: 3, windowMs: 1000 };
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(false);
  });

  it("reports remaining budget", () => {
    const key = `k-${Math.random()}`;
    expect(rateLimit(key, { limit: 2, windowMs: 1000 }).remaining).toBe(1);
    expect(rateLimit(key, { limit: 2, windowMs: 1000 }).remaining).toBe(0);
  });

  it("resets after the window elapses", () => {
    vi.useFakeTimers();
    const key = `k-${Math.random()}`;
    const opts = { limit: 1, windowMs: 1000 };
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(rateLimit(key, opts).ok).toBe(true);
  });

  it("keeps separate budgets per key", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    const opts = { limit: 1, windowMs: 1000 };
    expect(rateLimit(a, opts).ok).toBe(true);
    expect(rateLimit(b, opts).ok).toBe(true);
    expect(rateLimit(a, opts).ok).toBe(false);
  });
});

describe("isSameOrigin", () => {
  const make = (origin: string | null) =>
    new Request("https://example.com/api/track", {
      method: "POST",
      headers: origin ? { origin } : {},
    });

  it("accepts a matching origin", () => {
    expect(isSameOrigin(make("https://example.com"))).toBe(true);
  });

  it("rejects a different host", () => {
    expect(isSameOrigin(make("https://evil.example.net"))).toBe(false);
  });

  it("rejects a missing Origin header", () => {
    // Browsers always send Origin on a same-origin POST, so absence means the
    // caller isn't a page of ours.
    expect(isSameOrigin(make(null))).toBe(false);
  });

  it("rejects a malformed origin", () => {
    expect(isSameOrigin(make("not a url"))).toBe(false);
  });
});

describe("clientKey", () => {
  it("uses the first entry of x-forwarded-for", () => {
    const req = new Request("https://example.com/", {
      headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" },
    });
    expect(clientKey(req, "track")).toBe("track:1.2.3.4");
  });

  it("falls back to a shared bucket when the IP is unknown", () => {
    expect(clientKey(new Request("https://example.com/"), "track")).toBe(
      "track:unknown",
    );
  });
});
