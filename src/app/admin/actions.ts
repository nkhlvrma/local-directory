"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { slugify } from "@/lib/slug";
import { isValidPin } from "@/lib/pin";
import { findDuplicates } from "@/lib/dupes";
import {
  uploadListingPhoto,
  deleteListingPhotos,
  storagePathFromUrl,
} from "@/lib/listing-photo";
import { pickCategoryIcon } from "@/lib/category-icon-picker";
import { CITY_SLUG } from "@/lib/site";

// Mirrors the detail-page carousel cap (cover image + gallery = 5 slides).
const MAX_GALLERY_PHOTOS = 4;

export async function signIn(fd: FormData) {
  const email = String(fd.get("email") ?? "").trim();
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Invalid email or password." };
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// These four are bound directly as <form action={...}> handlers, which
// requires a void-returning function — errors are logged server-side rather
// than surfaced in the UI. Good enough for the admin basics; worth adding a
// toast/error surface later if mistakes turn out to be common.

export async function approveListing(listingId: string): Promise<void> {
  const user = await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("listings")
    .update({ status: "approved", approved_at: new Date().toISOString(), approved_by: user.id })
    .eq("id", listingId);
  if (error) console.error("approveListing failed:", error.message);
  revalidatePath("/admin");
}

export async function rejectListing(listingId: string): Promise<void> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("listings")
    .update({ status: "rejected" })
    .eq("id", listingId);
  if (error) console.error("rejectListing failed:", error.message);
  revalidatePath("/admin");
}

export async function setVerified(listingId: string, verified: boolean): Promise<void> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("listings")
    .update({ verified, verified_at: verified ? new Date().toISOString() : null })
    .eq("id", listingId);
  if (error) console.error("setVerified failed:", error.message);
  revalidatePath("/admin");
}

export async function dismissReport(reportId: string): Promise<void> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("listing_reports").delete().eq("id", reportId);
  if (error) console.error("dismissReport failed:", error.message);
  revalidatePath("/admin/reports");
}

// The three below return {error}/{ok} rather than being void form actions,
// since their forms need to surface validation errors inline (same pattern
// as the public list-your-business form).

// Shared by createListing and updateListing so the two can't drift.
// Returns an error string, or null when the file is absent or acceptable.
function validateImage(file: unknown, label: string): string | null {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!file.type.startsWith("image/")) return `${label} must be an image file.`;
  if (file.size > 5 * 1024 * 1024) return `${label} must be under 5MB.`;
  return null;
}

export async function createListing(fd: FormData): Promise<{ error?: string; ok?: boolean }> {
  const user = await requireAdmin();

  const name = String(fd.get("name") ?? "").trim();
  const whatsapp = String(fd.get("whatsapp_number") ?? "").trim();
  const categoryId = String(fd.get("category_id") ?? "");
  const neighborhoodId = String(fd.get("neighborhood_id") ?? "");
  const description = String(fd.get("description") ?? "").trim() || null;
  const pinRaw = String(fd.get("pin_code") ?? "").trim();
  const photo = fd.get("photo"); // grid/portrait thumbnail
  const coverPhoto = fd.get("cover_photo"); // detail-page hero, landscape
  // Extra hero images for the detail-page carousel. The cover leads, so the
  // gallery holds the remainder up to the carousel's cap.
  const galleryPhotos = fd
    .getAll("gallery")
    .filter((f): f is File => f instanceof File && f.size > 0);
  const publish = fd.get("publish") === "on";
  const verified = fd.get("verified") === "on";

  if (!name || name.length < 2) return { error: "Name is required." };
  if (!/^\+[1-9][0-9]{7,14}$/.test(whatsapp))
    return { error: "WhatsApp number must be in international format like +9198…" };
  if (!categoryId || !neighborhoodId)
    return { error: "Category and neighborhood are required." };
  if (pinRaw && !isValidPin(pinRaw))
    return { error: "PIN code must be 6 digits (e.g. 226010)." };
  const pin_code = pinRaw || null;

  const hasPhoto = photo instanceof File && photo.size > 0;
  const hasCoverPhoto = coverPhoto instanceof File && coverPhoto.size > 0;
  const photoError =
    validateImage(photo, "Grid photo") ??
    validateImage(coverPhoto, "Cover photo") ??
    galleryPhotos.map((f) => validateImage(f, "Each gallery photo")).find(Boolean) ??
    null;
  if (photoError) return { error: photoError };
  if (galleryPhotos.length > MAX_GALLERY_PHOTOS)
    return { error: `Choose at most ${MAX_GALLERY_PHOTOS} gallery photos.` };

  const admin = createSupabaseAdminClient();

  const dupes = await findDuplicates(admin, { name, whatsapp });
  const numberMatch = dupes.find((d) => d.whatsapp_number === whatsapp);
  if (numberMatch) {
    return { error: `That WhatsApp number is already listed as "${numberMatch.name}".` };
  }

  const now = new Date().toISOString();
  const base = slugify(name);
  for (let i = 0; i < 20; i++) {
    const slug = i === 0 ? base : `${base}-${i + 1}`;
    const { data, error } = await admin
      .from("listings")
      .insert({
        name,
        slug,
        category_id: categoryId,
        neighborhood_id: neighborhoodId,
        description,
        whatsapp_number: whatsapp,
        pin_code,
        status: publish ? "approved" : "pending",
        source: "manual",
        approved_at: publish ? now : null,
        approved_by: publish ? user.id : null,
        verified,
        verified_at: verified ? now : null,
      })
      .select("id")
      .single();

    if (!error) {
      // Independent uploads — run concurrently rather than one after the
      // other.
      const [uploadedPhoto, uploadedCover, uploadedGallery] = await Promise.all([
        hasPhoto ? uploadListingPhoto(admin, data.id, photo as File, "grid") : null,
        hasCoverPhoto ? uploadListingPhoto(admin, data.id, coverPhoto as File, "cover") : null,
        // Preserves the order the admin picked; a failed upload returns null
        // and is dropped rather than leaving a hole in the carousel.
        Promise.all(
          galleryPhotos.map((file, i) =>
            uploadListingPhoto(admin, data.id, file, `gallery-${i + 1}`),
          ),
        ).then((urls) => urls.filter((u): u is string => !!u)),
      ]);
      if (uploadedPhoto || uploadedCover || uploadedGallery.length > 0) {
        await admin
          .from("listings")
          .update({
            ...(uploadedPhoto ? { photo_url: uploadedPhoto } : {}),
            ...(uploadedCover ? { cover_photo_url: uploadedCover } : {}),
            ...(uploadedGallery.length > 0 ? { gallery_urls: uploadedGallery } : {}),
          })
          .eq("id", data.id);
      }
      revalidatePath("/admin");
      return { ok: true };
    }
    if (!error.message.includes("duplicate")) return { error: error.message };
  }
  return { error: "Could not create a unique slug — try a different name." };
}


export async function updateListing(fd: FormData): Promise<{ error?: string; ok?: boolean }> {
  await requireAdmin();

  const id = String(fd.get("id") ?? "");
  if (!id) return { error: "Missing listing id." };

  const name = String(fd.get("name") ?? "").trim();
  const whatsapp = String(fd.get("whatsapp_number") ?? "").trim();
  const categoryId = String(fd.get("category_id") ?? "");
  const neighborhoodId = String(fd.get("neighborhood_id") ?? "");
  const description = String(fd.get("description") ?? "").trim() || null;
  const pinRaw = String(fd.get("pin_code") ?? "").trim();
  const photo = fd.get("photo");
  const coverPhoto = fd.get("cover_photo");
  const galleryPhotos = fd
    .getAll("gallery")
    .filter((f): f is File => f instanceof File && f.size > 0);
  // Gallery images the admin left ticked. Anything already on the listing
  // but missing from this list has been removed in the form.
  const keptGallery = fd.getAll("keep_gallery").map(String);
  const verified = fd.get("verified") === "on";

  if (!name || name.length < 2) return { error: "Name is required." };
  if (!/^\+[1-9][0-9]{7,14}$/.test(whatsapp))
    return { error: "WhatsApp number must be in international format like +9198…" };
  if (!categoryId || !neighborhoodId)
    return { error: "Category and neighborhood are required." };
  if (pinRaw && !isValidPin(pinRaw))
    return { error: "PIN code must be 6 digits (e.g. 226010)." };
  const pin_code = pinRaw || null;

  const photoError =
    validateImage(photo, "Grid photo") ??
    validateImage(coverPhoto, "Cover photo") ??
    galleryPhotos.map((f) => validateImage(f, "Each gallery photo")).find(Boolean) ??
    null;
  if (photoError) return { error: photoError };
  if (keptGallery.length + galleryPhotos.length > MAX_GALLERY_PHOTOS)
    return {
      error: `A listing can have at most ${MAX_GALLERY_PHOTOS} gallery photos — remove some before adding more.`,
    };

  const admin = createSupabaseAdminClient();

  const { data: existing, error: loadError } = await admin
    .from("listings")
    .select("id, verified, verified_at, photo_url, cover_photo_url, gallery_urls")
    .eq("id", id)
    .maybeSingle();
  if (loadError) return { error: loadError.message };
  if (!existing) return { error: "That listing no longer exists." };
  const current = existing as {
    verified: boolean;
    verified_at: string | null;
    photo_url: string | null;
    cover_photo_url: string | null;
    gallery_urls: string[] | null;
  };

  // Same guard as create, minus this listing — otherwise saving an
  // unchanged number would report the listing as a duplicate of itself.
  const dupes = await findDuplicates(admin, { name, whatsapp });
  const numberMatch = dupes.find(
    (d) => d.whatsapp_number === whatsapp && d.id !== id,
  );
  if (numberMatch)
    return { error: `That WhatsApp number is already listed as "${numberMatch.name}".` };

  const [uploadedPhoto, uploadedCover, uploadedGallery] = await Promise.all([
    photo instanceof File && photo.size > 0
      ? uploadListingPhoto(admin, id, photo, "grid")
      : null,
    coverPhoto instanceof File && coverPhoto.size > 0
      ? uploadListingPhoto(admin, id, coverPhoto, "cover")
      : null,
    Promise.all(
      galleryPhotos.map((file, i) =>
        uploadListingPhoto(admin, id, file, `gallery-${Date.now()}-${i + 1}`),
      ),
    ).then((urls) => urls.filter((u): u is string => !!u)),
  ]);

  const now = new Date().toISOString();
  const { error } = await admin
    .from("listings")
    .update({
      name,
      category_id: categoryId,
      neighborhood_id: neighborhoodId,
      description,
      whatsapp_number: whatsapp,
      pin_code,
      verified,
      // Only stamp a fresh verified_at when verification actually flips on,
      // so re-saving a listing doesn't keep moving the date forward.
      verified_at: verified ? (current.verified ? current.verified_at : now) : null,
      ...(uploadedPhoto ? { photo_url: uploadedPhoto } : {}),
      ...(uploadedCover ? { cover_photo_url: uploadedCover } : {}),
      gallery_urls: [...keptGallery, ...uploadedGallery],
    })
    .eq("id", id);
  if (error) return { error: error.message };

  // Clear out images this edit orphaned: gallery entries that were dropped,
  // plus any cover/grid photo that was replaced. Only files in our own
  // bucket, and only after the row is safely updated.
  const orphaned = [
    ...(current.gallery_urls ?? []).filter((u) => !keptGallery.includes(u)),
    ...(uploadedPhoto && current.photo_url ? [current.photo_url] : []),
    ...(uploadedCover && current.cover_photo_url ? [current.cover_photo_url] : []),
  ];
  const paths = orphaned
    .map(storagePathFromUrl)
    .filter((p): p is string => !!p);
  if (paths.length > 0) {
    await admin.storage.from("listing-photos").remove(paths);
  }

  revalidatePath("/admin");
  revalidatePath("/", "layout");
  return { ok: true };
}

// Hard delete. Safe at the schema level: reports cascade with the listing
// and analytics_events keep their rows with a null listing_id, so history
// survives without dangling references.
export async function deleteListing(listingId: string): Promise<void> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();

  // Images first: once the row is gone we've lost the id that scopes them,
  // and orphaned files would sit in the bucket forever.
  await deleteListingPhotos(admin, listingId);

  const { error } = await admin.from("listings").delete().eq("id", listingId);
  if (error) console.error("deleteListing failed:", error.message);

  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function createCategory(fd: FormData): Promise<{ error?: string; ok?: boolean }> {
  await requireAdmin();

  const name = String(fd.get("name") ?? "").trim();
  const slugRaw = String(fd.get("slug") ?? "").trim();

  if (!name || name.length < 2) return { error: "Name is required." };
  const slug = slugify(slugRaw || name);
  if (!slug) return { error: "Could not derive a slug from that name — try adding letters." };

  // Icon is auto-assigned from the Lucide set based on the category name —
  // see category-icon-picker.ts. No manual icon input in the admin form.
  const icon = pickCategoryIcon(name);

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("categories").insert({ name, slug, icon });
  if (error) {
    if (error.message.includes("duplicate"))
      return { error: `A category with slug "${slug}" already exists.` };
    return { error: error.message };
  }
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function createNeighborhood(fd: FormData): Promise<{ error?: string; ok?: boolean }> {
  await requireAdmin();

  const name = String(fd.get("name") ?? "").trim();
  const slugRaw = String(fd.get("slug") ?? "").trim();

  if (!name || name.length < 2) return { error: "Name is required." };
  const slug = slugify(slugRaw || name);
  if (!slug) return { error: "Could not derive a slug from that name — try adding letters." };

  const admin = createSupabaseAdminClient();
  const { data: city, error: cityError } = await admin
    .from("cities")
    .select("id")
    .eq("slug", CITY_SLUG)
    .maybeSingle();
  if (cityError || !city) return { error: "Could not find the active city record." };

  const { error } = await admin
    .from("neighborhoods")
    .insert({ city_id: (city as { id: string }).id, name, slug });
  if (error) {
    if (error.message.includes("duplicate"))
      return { error: `A neighborhood with slug "${slug}" already exists.` };
    return { error: error.message };
  }
  revalidatePath("/admin/neighborhoods");
  return { ok: true };
}
