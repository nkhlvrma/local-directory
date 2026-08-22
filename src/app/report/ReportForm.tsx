"use client";

import { useState, useTransition } from "react";
import { submitReport } from "./actions";

export function ReportForm({ listingId }: { listingId: string }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) return <p className="text-sm">Thanks — we&apos;ll take a look.</p>;

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget);
        fd.set("listing_id", listingId);
        startTransition(async () => {
          const res = await submitReport(fd);
          if (res?.error) setError(res.error);
          else setDone(true);
        });
      }}
    >
      <select
        name="reason"
        required
        className="w-full rounded-xl border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 text-sm"
      >
        <option value="">Reason</option>
        <option value="closed">Closed / no longer operating</option>
        <option value="wrong_info">Wrong info</option>
        <option value="spam">Spam</option>
        <option value="other">Other</option>
      </select>
      <textarea
        name="note"
        rows={3}
        maxLength={400}
        placeholder="Optional note"
        className="w-full rounded-xl border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 text-sm"
      />
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <button
        type="submit"
        disabled={pending || !listingId}
        className="rounded-full bg-foreground text-background px-4 py-2 text-sm disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send report"}
      </button>
    </form>
  );
}
