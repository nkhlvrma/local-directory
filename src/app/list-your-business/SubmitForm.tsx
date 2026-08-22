"use client";

import { useState, useTransition } from "react";
import { submitListing } from "./actions";

type Option = { id: string; name: string };

export function SubmitForm({
  categories,
  neighborhoods,
}: {
  categories: Option[];
  neighborhoods: Option[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-sm">
        Thanks — your listing has been submitted for review.
      </div>
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const res = await submitListing(fd);
          if (res?.error) setError(res.error);
          else setDone(true);
        });
      }}
    >
      <Field label="Business name">
        <input name="name" required maxLength={80} className={inputClass} />
      </Field>
      <Field label="WhatsApp number (with country code, e.g. +9198…)">
        <input
          name="whatsapp_number"
          required
          placeholder="+919812345678"
          pattern="^\+[1-9][0-9]{7,14}$"
          className={inputClass}
        />
      </Field>
      <Field label="Category">
        <select name="category_id" required className={inputClass}>
          <option value="">Choose one</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Neighborhood">
        <select name="neighborhood_id" required className={inputClass}>
          <option value="">Choose one</option>
          {neighborhoods.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Short description (optional)">
        <textarea
          name="description"
          rows={3}
          maxLength={300}
          className={inputClass}
        />
      </Field>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-foreground text-background px-4 py-2 text-sm disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}

const inputClass =
  "mt-1 w-full rounded-xl border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/40 dark:focus:border-white/40";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="text-black/70 dark:text-white/70">{label}</span>
      {children}
    </label>
  );
}
