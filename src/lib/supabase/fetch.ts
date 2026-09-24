// fetch with a hard deadline, for Supabase clients created on the server.
//
// supabase-js has no default timeout. When Supabase is slow or unreachable
// (as during the 521 outage on 2026-09-22) a request just hangs until the
// platform kills the function — the visitor stares at a spinner and every
// second of the stall is billed compute. Failing fast turns that into a
// normal error: error.tsx for a page, a thrown unwrap() on a cached render
// (so the last good copy keeps serving), a {error} for an action.
//
// Any signal the caller passed is kept, so supabase-js's own aborts still
// work alongside the deadline.
export function fetchWithTimeout(ms: number): typeof fetch {
  return (input, init) => {
    const deadline = AbortSignal.timeout(ms);
    const signal = init?.signal
      ? AbortSignal.any([init.signal, deadline])
      : deadline;
    return fetch(input, { ...init, signal });
  };
}

// Reads and small writes. Normal queries return in well under a second.
export const QUERY_TIMEOUT_MS = 8_000;

// The admin client also uploads listing photos (up to 5 MB each).
export const UPLOAD_TIMEOUT_MS = 30_000;
