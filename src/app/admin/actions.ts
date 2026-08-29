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
import { CITY_SLUG, SITE_URL } from "@/lib/site";

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


// Minimum we enforce ourselves; Supabase's own floor is lower, and a
// 6-character admin password isn't worth defending.
const MIN_PASSWORD_LENGTH = 8;

// Step 1 of the reset: email a recovery link.
//
// The reply is deliberately the same whether or not the address has an
// account. This form sits on a login page anyone can reach, and a response
// that differed would turn it into a way to test which addresses are
// registered.
export async function requestPasswordReset(
  fd: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  const email = String(fd.get("email") ?? "").trim();
  if (!email || !email.includes("@")) return { error: "Enter a valid email address." };

  const supabase = await createSupabaseServerClient();
  // The callback exchanges the emailed code for a session, then forwards to
  // the form where the new password is set.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/admin/auth/callback?next=/admin/reset-password`,
  });

  return { ok: true };
}

// Step 2: set the new password. Reached with the short-lived session the
// callback established from the emailed link, so there's no old password to
// re-enter — possession of the link is the proof.
export async function updatePassword(
  fd: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("confirm_password") ?? "");

  if (password.length < MIN_PASSWORD_LENGTH)
    return { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  if (password !== confirm) return { error: "Those passwords don't match." };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return {
      error: "That reset link has expired. Request a new one and try again.",
    };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  return { ok: true };
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

export async function createListing(
  fd: FormData,
): Promise<{ error?: string; ok?: boolean; id?: string }> {
  const user = await requireAdmin();

  const name = String(fd.get("name") ?? "").trim();
  const whatsapp = String(fd.get("whatsapp_number") ?? "").trim();
  const categoryId = String(fd.get("category_id") ?? "");
  const neighborhoodId = String(fd.get("neighborhood_id") ?? "");
  const description = String(fd.get("description") ?? "").trim() || null;
  const pinRaw = String(fd.get("pin_code") ?? "").trim();
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
      // Photos follow as their own requests, keyed on this id.
      revalidatePath("/admin");
      return { ok: true, id: data.id as string };
    }
    if (!error.message.includes("duplicate")) return { error: error.message };
  }
  return { error: "Could not create a unique slug — try a different name." };
}



type RevalidateTarget = {
  slug: string;
  categories: { slug: string } | null;
  neighborhoods: { slug: string; cities: { slug: string } | null } | null;
};

// Revalidate exactly the pages a listing appears on.
//
// This used to be revalidatePath("/", "layout"), which purges the entire
// route tree: every save made the router refetch the whole app (and, in
// production, threw away the ISR cache for every page) — slow enough that a
// save looked like it had hung.
function revalidateListing(target: RevalidateTarget | null) {
  revalidatePath("/admin");
  if (!target) return;
  const city = target.neighborhoods?.cities?.slug;
  const hood = target.neighborhoods?.slug;
  const category = target.categories?.slug;
  if (city && hood && category) {
    revalidatePath(`/${city}/${hood}/${category}/${target.slug}`);
    revalidatePath(`/${city}/c/${category}`);
    revalidatePath(`/${city}/n/${hood}`);
  }
}


// Photos upload one per request, rather than riding along with the rest of
// the form.
//
// A listing can carry six images at up to 5MB each, but a Server Action
// request is capped far below that — Next's own bodySizeLimit, and on
// Vercel a hard ~4.5MB serverless body limit that no config can raise. Sent
// together they blew past it and the save failed with a 413 after a long
// stall. One file per request keeps every upload comfortably inside the cap.
export async function uploadListingImage(
  fd: FormData,
): Promise<{ url?: string; error?: string }> {
  await requireAdmin();

  const listingId = String(fd.get("listing_id") ?? "");
  const kind = String(fd.get("kind") ?? "");
  const file = fd.get("file");

  if (!listingId) return { error: "Missing listing id." };
  if (!["cover", "grid", "gallery"].includes(kind)) return { error: "Unknown photo kind." };
  if (!(file instanceof File) || file.size === 0) return { error: "No file received." };

  const invalid = validateImage(file, "Photo");
  if (invalid) return { error: invalid };

  const admin = createSupabaseAdminClient();

  const { data: existing } = await admin
    .from("listings")
    .select("photo_url, cover_photo_url, gallery_urls")
    .eq("id", listingId)
    .maybeSingle();
  if (!existing) return { error: "That listing no longer exists." };
  const current = existing as {
    photo_url: string | null;
    cover_photo_url: string | null;
    gallery_urls: string[] | null;
  };

  const gallery = current.gallery_urls ?? [];
  if (kind === "gallery" && gallery.length >= MAX_GALLERY_PHOTOS)
    return { error: `A listing can have at most ${MAX_GALLERY_PHOTOS} gallery photos.` };

  // Timestamped path, so replacing a photo never collides with the one it
  // replaces while both briefly exist.
  const url = await uploadListingPhoto(admin, listingId, file, `${kind}-${Date.now()}`);
  if (!url) return { error: "Upload failed — try again." };

  const replaced =
    kind === "cover" ? current.cover_photo_url : kind === "grid" ? current.photo_url : null;

  const { error } = await admin
    .from("listings")
    .update(
      kind === "cover"
        ? { cover_photo_url: url }
        : kind === "grid"
          ? { photo_url: url }
          : { gallery_urls: [...gallery, url] },
    )
    .eq("id", listingId);
  if (error) return { error: error.message };

  // Only bin the old file once the row points at the new one.
  const replacedPath = replaced ? storagePathFromUrl(replaced) : null;
  if (replacedPath) await admin.storage.from("listing-photos").remove([replacedPath]);

  return { url };
}

export async function updateListing(
  fd: FormData,
): Promise<{ error?: string; ok?: boolean; id?: string }> {
  await requireAdmin();

  const id = String(fd.get("id") ?? "");
  if (!id) return { error: "Missing listing id." };

  const name = String(fd.get("name") ?? "").trim();
  const whatsapp = String(fd.get("whatsapp_number") ?? "").trim();
  const categoryId = String(fd.get("category_id") ?? "");
  const neighborhoodId = String(fd.get("neighborhood_id") ?? "");
  const description = String(fd.get("description") ?? "").trim() || null;
  const pinRaw = String(fd.get("pin_code") ?? "").trim();
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

  const admin = createSupabaseAdminClient();

  const { data: existing, error: loadError } = await admin
    .from("listings")
    .select(
      "id, slug, verified, verified_at, photo_url, cover_photo_url, gallery_urls, categories(slug), neighborhoods(slug, cities(slug))",
    )
    .eq("id", id)
    .maybeSingle();
  if (loadError) return { error: loadError.message };
  if (!existing) return { error: "That listing no longer exists." };
  const current = existing as unknown as {
    slug: string;
    categories: { slug: string } | null;
    neighborhoods: { slug: string; cities: { slug: string } | null } | null;
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
      gallery_urls: keptGallery,
    })
    .eq("id", id);
  if (error) return { error: error.message };

  // Clear out images this edit orphaned: gallery entries that were dropped,
  // plus any cover/grid photo that was replaced. Only files in our own
  // bucket, and only after the row is safely updated.
  const orphaned = (current.gallery_urls ?? []).filter(
    (u) => !keptGallery.includes(u),
  );
  const paths = orphaned
    .map(storagePathFromUrl)
    .filter((p): p is string => !!p);
  if (paths.length > 0) {
    await admin.storage.from("listing-photos").remove(paths);
  }

  revalidateListing(current);
  return { ok: true, id };
}

// Hard delete. Safe at the schema level: reports cascade with the listing
// and analytics_events keep their rows with a null listing_id, so history
// survives without dangling references.
export async function deleteListing(listingId: string): Promise<void> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();

  // Read the slugs before the row goes — they're needed to revalidate the
  // public pages this listing appeared on.
  const { data: row } = await admin
    .from("listings")
    .select("slug, categories(slug), neighborhoods(slug, cities(slug))")
    .eq("id", listingId)
    .maybeSingle();
  const target = row as unknown as RevalidateTarget | null;

  // Images first: once the row is gone we've lost the id that scopes them,
  // and orphaned files would sit in the bucket forever.
  await deleteListingPhotos(admin, listingId);

  const { error } = await admin.from("listings").delete().eq("id", listingId);
  if (error) console.error("deleteListing failed:", error.message);

  revalidateListing(target);
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
