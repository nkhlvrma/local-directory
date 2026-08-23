"use client";

import { useState, useTransition } from "react";
import { importListings, type ImportResult } from "./actions";

export function ImportForm() {
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        placeholder={
          "Anita's Home Kitchen\ttiffin-services\tgomti-nagar\t+919812345678\tHome-cooked North Indian tiffin.\ttrue"
        }
        className="w-full rounded-xl border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 text-sm font-mono"
      />
      <div className="flex items-center gap-3">
        <button
          disabled={pending || !text.trim()}
          onClick={() => {
            setResult(null);
            startTransition(async () => {
              const res = await importListings(text);
              setResult(res);
            });
          }}
          className="rounded-full bg-foreground text-background px-4 py-2 text-sm disabled:opacity-50"
        >
          {pending ? "Importing…" : "Import"}
        </button>
        <span className="text-xs text-black/60 dark:text-white/60">
          Rows land as <code>pending</code> — review at <code>/admin</code>.
        </span>
      </div>

      {result ? (
        <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4 text-sm space-y-2">
          <p>
            <strong>{result.inserted}</strong> inserted ·{" "}
            <strong>{result.failed.length}</strong> failed
          </p>
          {result.failed.length > 0 ? (
            <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
              {result.failed.map((f, i) => (
                <li key={i}>
                  Row {f.row}: {f.error}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
