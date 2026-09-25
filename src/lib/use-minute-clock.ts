"use client";

import { useSyncExternalStore } from "react";

// Re-evaluates `read` every minute on the client, and returns `null` during
// server rendering. For time-dependent UI ("Open now", "today") on pages that
// are cached: the value must come from the visitor's current moment, never
// from whenever the cached HTML happened to be rendered.
function subscribeMinute(onChange: () => void): () => void {
  const t = setInterval(onChange, 60_000);
  return () => clearInterval(t);
}

const serverSnapshot = () => null;

// `read` must return a primitive (compared with Object.is between renders).
export function useMinuteClock<T extends string | number | boolean | null>(
  read: () => T,
): T | null {
  return useSyncExternalStore(subscribeMinute, read, serverSnapshot);
}
