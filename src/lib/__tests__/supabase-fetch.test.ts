import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchWithTimeout } from "../supabase/fetch";

// A fetch that never settles on its own — only an abort ends it.
function hangingFetch() {
  return vi.fn(
    (_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(init.signal!.reason),
        );
      }),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("fetchWithTimeout", () => {
  it("aborts a request that outlives the deadline", async () => {
    vi.stubGlobal("fetch", hangingFetch());
    await expect(fetchWithTimeout(20)("https://example.test")).rejects.toThrow(
      /timeout|aborted/i,
    );
  });

  it("passes a fast response straight through", async () => {
    const ok = new Response("ok");
    vi.stubGlobal("fetch", vi.fn(async () => ok));
    await expect(fetchWithTimeout(1_000)("https://example.test")).resolves.toBe(ok);
  });

  it("still honours the caller's own abort signal", async () => {
    vi.stubGlobal("fetch", hangingFetch());
    const caller = new AbortController();
    const pending = fetchWithTimeout(60_000)("https://example.test", {
      signal: caller.signal,
    });
    caller.abort(new Error("cancelled by caller"));
    await expect(pending).rejects.toThrow("cancelled by caller");
  });
});
