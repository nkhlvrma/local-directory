"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { RecentEntry } from "./TrackView";

const KEY = "recently-viewed-v1";

// useSyncExternalStore requires getSnapshot to return the SAME reference when
// the underlying data hasn't changed — otherwise React re-renders in a loop
// (React error #185). Cache the parsed value keyed on the raw string.
const EMPTY: RecentEntry[] = [];
let cachedRaw: string | null | undefined = undefined;
let cachedItems: RecentEntry[] = EMPTY;

function getClientSnapshot(): RecentEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === cachedRaw) return cachedItems;
    cachedRaw = raw;
    cachedItems = raw ? (JSON.parse(raw) as RecentEntry[]) : EMPTY;
    return cachedItems;
  } catch {
    return cachedItems;
  }
}

function getServerSnapshot(): RecentEntry[] {
  return EMPTY;
}

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("recently-viewed-change", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("recently-viewed-change", onStoreChange);
  };
}

export function RecentlyViewed() {
  const items = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (items.length === 0) return null;
  const shown = items.slice(0, 4);

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        Recently viewed
      </h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {shown.map((r) => (
          <Link key={r.id} href={r.href} className="block group">
            <Card
              size="sm"
              className="border border-border/70 shadow-none ring-0 transition-all hover:border-primary/30 hover:bg-muted/30"
            >
              <CardContent className="flex gap-3">
                {r.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.photo_url}
                    alt=""
                    style={{ width: 48, height: 48 }}
                    className="rounded-lg object-cover shrink-0"
                  />
                ) : null}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold truncate">{r.name}</span>
                    {r.verified ? (
                      <Check className="size-3.5 text-primary shrink-0" strokeWidth={2.5} />
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {r.category} · {r.neighborhood}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
