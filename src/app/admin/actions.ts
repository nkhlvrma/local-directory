"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { slugify } from "@/lib/slug";
import { isValidPin } from "@/lib/pin";
import { findDuplicates } from "@/lib/dupes";
import { uploadListingPhoto } from "@/lib/listing-photo";
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
  if (hasPhoto) {
    const file = photo as File;
    if (!file.type.startsWith("image/")) return { error: "Grid photo must be an image file." };
    if (file.size > 5 * 1024 * 1024) return { error: "Grid photo must be under 5MB." };
  }
  const hasCoverPhoto = coverPhoto instanceof File && coverPhoto.size > 0;
  if (hasCoverPhoto) {
    const file = coverPhoto as File;
    if (!file.type.startsWith("image/")) return { error: "Cover photo must be an image file." };
    if (file.size > 5 * 1024 * 1024) return { error: "Cover photo must be under 5MB." };
  }

  if (galleryPhotos.length > MAX_GALLERY_PHOTOS)
    return { error: `Choose at most ${MAX_GALLERY_PHOTOS} gallery photos.` };
  for (const file of galleryPhotos) {
    if (!file.type.startsWith("image/"))
      return { error: "Gallery photos must be image files." };
    if (file.size > 5 * 1024 * 1024)
      return { error: "Each gallery photo must be under 5MB." };
  }

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
