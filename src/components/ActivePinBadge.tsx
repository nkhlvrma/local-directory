"use client";

import { useSyncExternalStore } from "react";
import { Badge } from "@/components/ui/badge";
import {
  getFilterSnapshot,
  getServerFilterSnapshot,
  subscribeFilters,
} from "@/lib/listing-filters";

// The PIN lives in a cookie. Reading it on the server would make every browse
// page dynamic, so the badge resolves on the client instead — it renders
// nothing during SSR, which is correct: the cached HTML must not claim a PIN
// that belongs to one particular visitor.
export function ActivePinBadge() {
  const { pin } = useSyncExternalStore(
    subscribeFilters,
    getFilterSnapshot,
    getServerFilterSnapshot,
  );
  if (!pin) return null;
  return (
    <Badge className="bg-primary/10 text-primary border-primary/20 font-mono">
      {pin}
    </Badge>
  );
}
