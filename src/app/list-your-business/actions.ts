"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isMockMode } from "@/lib/supabase/mock";
import { verifyTurnstile } from "@/lib/turnstile";
import { findListingByWhatsapp } from "@/lib/dupes";
import { uploadListingPhoto } from "@/lib/listing-photo";
import {
  insertListingWithUniqueSlug,
  parseListingFields,
  validateImage,
} from "@/lib/listing-input";

export async function submitListing(fd: FormData) {
  const turnstileToken = fd.get("cf-turnstile-response");
  const photo = fd.get("photo");

  if (fd.get("consent") !== "on")
    return { error: "You must agree to the listing terms before submitting." };

  const passed = await verifyTurnstile(
    typeof turnstileToken === "string" ? turnstileToken : null,
  );
  if (!passed)
    return { error: "Bot check failed. Refresh the page and try again." };

  const parsed = parseListingFields(fd);
  if (parsed.error !== undefined) return { error: parsed.error };
  const { fields } = parsed;

  const photoError = validateImage(photo, "Photo");
  if (photoError) return { error: photoError };

  const admin = createSupabaseAdminClient();

  // One listing per WhatsApp number. Name-similarity we let through (admin
  // can catch it at review).
  const { hit, error: lookupError } = await findListingByWhatsapp(
    admin,
    fields.whatsapp_number,
  );
  if (lookupError) return { error: "Something went wrong — please try again." };
  if (hit) {
    return {
      error: `That WhatsApp is already listed as "${hit.name}". If this is you, contact us to update it.`,
    };
  }

  const inserted = await insertListingWithUniqueSlug(admin, {
    ...fields,
    status: "pending",
    source: "self_serve",
  });
  if (inserted.error !== undefined) return { error: inserted.error };
  const { id } = inserted;

  if (photo instanceof File && photo.size > 0 && !isMockMode()) {
    // Photo upload is best-effort: a failure here shouldn't fail the
    // whole submission — the business is still listed, just photo-less.
    const uploaded = await uploadListingPhoto(admin, id, photo);
    if (uploaded) {
      await admin.from("listings").update({ photo_url: uploaded }).eq("id", id);
    }
  }
  return { ok: true };
}
