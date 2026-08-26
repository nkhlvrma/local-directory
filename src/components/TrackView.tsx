"use client";

import { useEffect } from "react";

const KEY = "recently-viewed-v1";
const MAX = 8;

export type RecentEntry = {
  id: string;
  name: string;
  href: string;
  category: string;
  neighborhood: string;
  photo_url: string | null;
  verified: boolean;
};

// Silent client-only side effect: push this listing to a localStorage list
// so <RecentlyViewed /> can show it on the home page next visit.
export function TrackView(props: RecentEntry) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const arr: RecentEntry[] = raw ? JSON.parse(raw) : [];
      const filtered = arr.filter((e) => e.id !== props.id);
      const next = [props, ...filtered].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // storage blocked (private mode, quota) — silent no-op
    }
    // Only run once per mount; props for a page load are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
