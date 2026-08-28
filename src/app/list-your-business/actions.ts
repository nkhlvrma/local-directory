"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slug";
import { verifyTurnstile } from "@/lib/turnstile";
import { isValidPin } from "@/lib/pin";
import { findDuplicates } from "@/lib/dupes";

export async function submitListing(fd: FormData) {
  const name = String(fd.get("name") ?? "").trim();
  const whatsapp = String(fd.get("whatsapp_number") ?? "").trim();
  const categoryId = String(fd.get("category_id") ?? "");
  const neighborhoodId = String(fd.get("neighborhood_id") ?? "");
  const description = String(fd.get("description") ?? "").trim() || null;
  const pinRaw = String(fd.get("pin_code") ?? "").trim();
  const consent = fd.get("consent");
  const turnstileToken = fd.get("cf-turnstile-response");

  if (consent !== "on")
    return { error: "You must agree to the listing terms before submitting." };

  const passed = await verifyTurnstile(
    typeof turnstileToken === "string" ? turnstileToken : null,
  );
  if (!passed)
    return { error: "Bot check failed. Refresh the page and try again." };

  if (!name || name.length < 2) return { error: "Name is required." };
  if (!/^\+[1-9][0-9]{7,14}$/.test(whatsapp))
    return { error: "WhatsApp number must be in international format like +9198…" };
  if (!categoryId || !neighborhoodId)
    return { error: "Category and neighborhood are required." };
  if (pinRaw && !isValidPin(pinRaw))
    return { error: "PIN code must be 6 digits (e.g. 226010)." };
  const pin_code = pinRaw || null;

  const base = slugify(name);
  const admin = createSupabaseAdminClient();

  // Dupe warning: if the WhatsApp number matches an existing listing
  // exactly, refuse. Name-similarity we let through (admin can catch it).
  const dupes = await findDuplicates(admin, { name, whatsapp });
  const numberMatch = dupes.find((d) => d.whatsapp_number === whatsapp);
  if (numberMatch) {
    return {
      error: `That WhatsApp is already listed as "${numberMatch.name}". If this is you, contact us to update it.`,
    };
  }

  for (let i = 0; i < 20; i++) {
    const slug = i === 0 ? base : `${base}-${i + 1}`;
    const { error } = await admin.from("listings").insert({
      name,
      slug,
      category_id: categoryId,
      neighborhood_id: neighborhoodId,
      description,
      whatsapp_number: whatsapp,
      pin_code,
      status: "pending",
      source: "self_serve",
    });
    if (!error) return { ok: true };
    if (!error.message.includes("duplicate")) return { error: error.message };
  }
  return { error: "Could not create a unique slug — try a different name." };
}
