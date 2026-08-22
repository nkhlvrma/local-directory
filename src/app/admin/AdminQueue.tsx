"use client";

import { useState, useTransition } from "react";
import { decideListing } from "./actions";

type Item = {
  id: string;
  name: string;
  description: string | null;
  whatsapp_number: string;
  created_at: string;
  category: string;
  neighborhood: string;
};

export function AdminQueue({ items }: { items: Item[] }) {
  const [pending, startTransition] = useTransition();
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  if (items.length === 0) {
    return (
      <p className="text-sm text-black/60 dark:text-white/60">Queue is empty.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {items
        .filter((i) => !hidden.has(i.id))
        .map((i) => (
          <li
            key={i.id}
            className="rounded-2xl border border-black/10 dark:border-white/10 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{i.name}</div>
                <div className="mt-0.5 text-xs text-black/60 dark:text-white/60">
                  {i.category} · {i.neighborhood} · {i.whatsapp_number}
                </div>
                {i.description ? (
                  <p className="mt-2 text-sm">{i.description}</p>
                ) : null}
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await decideListing(i.id, "approve");
                    setHidden((s) => new Set(s).add(i.id));
                  })
                }
                className="rounded-full bg-green-600 text-white px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Approve
              </button>
              <button
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await decideListing(i.id, "reject");
                    setHidden((s) => new Set(s).add(i.id));
                  })
                }
                className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </li>
        ))}
    </ul>
  );
}
