"use server";

import { headers } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyTurnstile } from "@/lib/turnstile";
import { rateLimit } from "@/lib/rate-limit";

// Reports are an unauthenticated write, so this mirrors the protections on the
// listing-submission form: a Turnstile check, a per-IP rate limit, a closed
// set of reasons, a length cap on free text, and a check that the listing
// actually exists. Postgres errors are logged, never returned — the previous
// version handed `error.message` straight to the browser.

const REASONS = new Set(["closed", "wrong_info", "spam", "other"]);
const MAX_NOTE = 400;
const GENERIC_ERROR = "Something went wrong. Please try again.";

export async function submitReport(fd: FormData) {
  const listing_id = String(fd.get("listing_id") ?? "");
  const reason = String(fd.get("reason") ?? "");
  const note = String(fd.get("note") ?? "").trim().slice(0, MAX_NOTE) || null;

  if (!listing_id || !reason) return { error: "Missing fields" };
  if (!REASONS.has(reason)) return { error: "Invalid reason" };

  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { ok } = rateLimit(`report:${ip}`, { limit: 5, windowMs: 60 * 60 * 1000 });
  if (!ok) return { error: "Too many reports. Please try again later." };

  const token = fd.get("cf-turnstile-response");
  const human = await verifyTurnstile(typeof token === "string" ? token : null);
  if (!human) return { error: "Could not verify you're human. Please retry." };

  const admin = createSupabaseAdminClient();

  // Don't let a report be filed against an id that isn't a real listing —
  // otherwise the table accepts arbitrary UUIDs from anyone.
  const { data: listing } = await admin
    .from("listings")
    .select("id")
    .eq("id", listing_id)
    .eq("status", "approved")
    .maybeSingle();
  if (!listing) return { error: "That listing could not be found." };

  const { error } = await admin
    .from("listing_reports")
    .insert({ listing_id, reason, note });
  if (error) {
    console.error("submitReport insert failed", error);
    return { error: GENERIC_ERROR };
  }
  return { ok: true };
}
