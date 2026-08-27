"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RecentEntry } from "./TrackView";

const KEY = "recently-viewed-v1";

export function RecentlyViewed() {
  const items = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      window.addEventListener("recently-viewed-change", onStoreChange);
      return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener("recently-viewed-change", onStoreChange);
      };
    },
    () => {
      try {
        const raw = localStorage.getItem(KEY);
        return raw ? (JSON.parse(raw) as RecentEntry[]) : [];
      } catch {
        return [];
      }
    },
    () => [],
  );

  if (items.length === 0) return null;
  const shown = items.slice(0, 4);

  return (
    <section>
      <h2 className="text-sm font-medium text-muted-foreground mb-3">
        Recently viewed
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {shown.map((r) => (
          <Link key={r.id} href={r.href} className="block">
            <Card className="p-3 flex items-center gap-3 transition-colors hover:bg-muted/50">
              {r.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.photo_url}
                  alt=""
                  style={{ width: 48, height: 48 }}
                  className="rounded-md object-cover shrink-0"
                />
              ) : null}
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium truncate">{r.name}</span>
                  {r.verified ? (
                    <Badge className="bg-green-100 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-200">
                      ✓
                    </Badge>
                  ) : null}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {r.category} · {r.neighborhood}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
