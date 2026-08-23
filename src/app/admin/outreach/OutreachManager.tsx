"use client";

import { useMemo, useState, useTransition } from "react";
import type { Lead } from "./page";
import {
  addLeads,
  updateLeadStatus,
  convertLeadToListing,
  type AddResult,
} from "./actions";
import { outreachMessage, outreachWaLink, type MessageLang } from "@/lib/outreach";

type Option = { id: string; slug: string; name: string };
type StatusFilter = "all" | Lead["status"];

const STATUS_LABELS: Record<Lead["status"], string> = {
  lead: "Lead",
  contacted: "Contacted",
  yes: "Yes",
  no: "No",
  no_response: "No response",
};

const STATUS_STYLES: Record<Lead["status"], string> = {
  lead: "bg-black/10 dark:bg-white/10",
  contacted: "bg-amber-500/20 text-amber-900 dark:text-amber-200",
  yes: "bg-green-500/20 text-green-800 dark:text-green-300",
  no: "bg-red-500/20 text-red-800 dark:text-red-300",
  no_response: "bg-black/10 dark:bg-white/10 text-black/60 dark:text-white/60",
};

export function OutreachManager({
  categories,
  neighborhoods,
  initialLeads,
}: {
  categories: Option[];
  neighborhoods: Option[];
  initialLeads: Lead[];
}) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [lang, setLang] = useState<MessageLang>("hinglish");
  const [showAdd, setShowAdd] = useState(initialLeads.length === 0);
  const [text, setText] = useState("");
  const [addResult, setAddResult] = useState<AddResult | null>(null);
  const [pending, startTransition] = useTransition();

  const visible = useMemo(
    () => (filter === "all" ? leads : leads.filter((l) => l.status === filter)),
    [leads, filter],
  );

  function replaceLead(next: Lead) {
    setLeads((all) => all.map((l) => (l.id === next.id ? next : l)));
  }

  return (
    <div className="space-y-6">
      {/* --- Add leads --- */}
      <section className="rounded-2xl border border-black/10 dark:border-white/10">
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium"
        >
          <span>Add candidate businesses</span>
          <span className="text-black/50 dark:text-white/50">
            {showAdd ? "hide" : "show"}
          </span>
        </button>
        {showAdd ? (
          <div className="px-4 pb-4 space-y-3">
            <p className="text-xs text-black/60 dark:text-white/60">
              Paste tab-separated rows (from Google Sheets). Columns:{" "}
              <code>business_name</code> · <code>whatsapp</code> ·{" "}
              <code>category_slug</code> · <code>neighborhood_slug</code> ·{" "}
              <code>note</code>
            </p>
            <details className="text-xs">
              <summary className="cursor-pointer text-black/60 dark:text-white/60">
                Available slugs
              </summary>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <div className="font-medium">Categories</div>
                  <ul className="mt-1 space-y-0.5">
                    {categories.map((c) => (
                      <li key={c.slug}>
                        <code>{c.slug}</code>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="font-medium">Neighborhoods</div>
                  <ul className="mt-1 space-y-0.5">
                    {neighborhoods.map((n) => (
                      <li key={n.slug}>
                        <code>{n.slug}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder={
                "Anita's Home Kitchen\t+919812345678\ttiffin-services\tgomti-nagar\tfrom Google Maps"
              }
              className="w-full rounded-xl border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 text-sm font-mono"
            />
            <div className="flex items-center gap-3">
              <button
                disabled={pending || !text.trim()}
                onClick={() => {
                  setAddResult(null);
                  startTransition(async () => {
                    const res = await addLeads(text);
                    setAddResult(res);
                    if (res.inserted.length > 0) {
                      setLeads((all) => [...res.inserted, ...all]);
                      setText("");
                    }
                  });
                }}
                className="rounded-full bg-foreground text-background px-4 py-2 text-sm disabled:opacity-50"
              >
                {pending ? "Adding…" : "Add to queue"}
              </button>
              {addResult ? (
                <span className="text-xs text-black/60 dark:text-white/60">
                  {addResult.inserted.length} added ·{" "}
                  {addResult.failed.length} failed
                </span>
              ) : null}
            </div>
            {addResult && addResult.failed.length > 0 ? (
              <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                {addResult.failed.map((f, i) => (
                  <li key={i}>
                    Row {f.row}: {f.error}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </section>

      {/* --- Controls --- */}
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "lead", "contacted", "yes", "no", "no_response"] as const).map(
          (f) => {
            const count =
              f === "all" ? leads.length : leads.filter((l) => l.status === f).length;
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 text-xs border ${
                  active
                    ? "bg-foreground text-background border-transparent"
                    : "border-black/15 dark:border-white/20"
                }`}
              >
                {f === "all" ? "All" : STATUS_LABELS[f]} ({count})
              </button>
            );
          },
        )}
        <div className="ml-auto flex items-center gap-2 text-xs">
          <span className="text-black/60 dark:text-white/60">Message language:</span>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as MessageLang)}
            className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1 text-xs"
          >
            <option value="hinglish">Hinglish</option>
            <option value="hi">हिंदी</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      {/* --- Message preview --- */}
      <MessagePreview lang={lang} sampleCategory={categories[0]?.name ?? "tiffin services"} />

      {/* --- Leads list --- */}
      {visible.length === 0 ? (
        <p className="text-sm text-black/60 dark:text-white/60">
          {leads.length === 0
            ? "No leads yet. Paste candidates above to get started."
            : "No leads match this filter."}
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map((l) => (
            <li
              key={l.id}
              className="rounded-2xl border border-black/10 dark:border-white/10 p-4"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{l.business_name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[l.status]}`}
                    >
                      {STATUS_LABELS[l.status]}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-black/60 dark:text-white/60">
                    {[
                      l.categories?.name,
                      l.neighborhoods?.name,
                      l.whatsapp_number,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                  {l.source_note ? (
                    <p className="mt-1 text-xs text-black/50 dark:text-white/50">
                      {l.source_note}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={outreachWaLink(
                      l.whatsapp_number,
                      lang,
                      l.categories?.name ?? "local services",
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      startTransition(async () => {
                        const next = await updateLeadStatus(l.id, "contacted");
                        if (next) replaceLead(next);
                      })
                    }
                    className="rounded-full bg-[#25D366] text-black px-3 py-1.5 text-xs font-medium"
                  >
                    Message on WhatsApp
                  </a>
                  <button
                    disabled={pending || !l.categories || !l.neighborhoods || l.status === "yes"}
                    onClick={() =>
                      startTransition(async () => {
                        const next = await convertLeadToListing(l.id);
                        if (next) replaceLead(next);
                      })
                    }
                    className="rounded-full bg-green-600 text-white px-3 py-1.5 text-xs disabled:opacity-40"
                    title="Create a listing (pending) linked to this lead"
                  >
                    Yes → create listing
                  </button>
                  <button
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const next = await updateLeadStatus(l.id, "no");
                        if (next) replaceLead(next);
                      })
                    }
                    className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1.5 text-xs disabled:opacity-40"
                  >
                    No
                  </button>
                  <button
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const next = await updateLeadStatus(l.id, "no_response");
                        if (next) replaceLead(next);
                      })
                    }
                    className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1.5 text-xs disabled:opacity-40"
                  >
                    No response
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MessagePreview({
  lang,
  sampleCategory,
}: {
  lang: MessageLang;
  sampleCategory: string;
}) {
  return (
    <details className="rounded-2xl border border-black/10 dark:border-white/10 p-3 text-sm">
      <summary className="cursor-pointer text-black/70 dark:text-white/70">
        Preview outreach message
      </summary>
      <pre className="mt-2 whitespace-pre-wrap text-xs bg-black/[.04] dark:bg-white/[.05] p-3 rounded">
        {outreachMessage(lang, sampleCategory)}
      </pre>
    </details>
  );
}
