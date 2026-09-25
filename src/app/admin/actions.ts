"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { slugify } from "@/lib/slug";
import { findListingByWhatsapp } from "@/lib/dupes";
import {
  uploadListingPhoto,
  deleteListingPhotos,
  storagePathFromUrl,
} from "@/lib/listing-photo";
import {
  UNIQUE_VIOLATION,
  insertListingWithUniqueSlug,
  parseListingFields,
  validateImage,
} from "@/lib/listing-input";
import { pickCategoryIcon } from "@/lib/category-icon-picker";
import { CITY_SLUG } from "@/lib/site";
import { TAXONOMY_TAG } from "@/lib/taxonomy";
import { requestOrigin } from "@/lib/request-origin";
import { parseHoursInput } from "@/lib/hours";
import { parseFieldsSchemaInput, parseFieldValuesInput } from "@/lib/category-fields";
import type { FieldDef } from "@/lib/types";

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
  //
  // Sent without a query string on purpose: Supabase matches this against its
  // Redirect URLs allow list and drops it for the Site URL root when it fails
  // to match, which lands the admin on the homepage holding an unused code.
  // A bare path is the easiest shape to allow-list correctly. The callback
  // already defaults to /admin/reset-password, so `next` adds nothing here.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await requestOrigin()}/admin/auth/callback`,
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

// These are bound directly as <form action={...}> handlers, which
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
  await revalidateListingById(admin, listingId);
}

export async function rejectListing(listingId: string): Promise<void> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("listings")
    .update({ status: "rejected" })
    .eq("id", listingId);
  if (error) console.error("rejectListing failed:", error.message);
  await revalidateListingById(admin, listingId);
}

// Takes an approved listing off the public site without deleting it (status
// "removed"). approveListing brings it back.
export async function unpublishListing(listingId: string): Promise<void> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("listings")
    .update({ status: "removed" })
    .eq("id", listingId);
  if (error) console.error("unpublishListing failed:", error.message);
  await revalidateListingById(admin, listingId);
}

export async function setVerified(listingId: string, verified: boolean): Promise<void> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("listings")
    .update({ verified, verified_at: verified ? new Date().toISOString() : null })
    .eq("id", listingId);
  if (error) console.error("setVerified failed:", error.message);
  await revalidateListingById(admin, listingId);
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

// Error for a WhatsApp number some other listing already uses, or null.
async function duplicateNumberError(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  whatsapp: string,
  excludeId?: string,
): Promise<string | null> {
  const { hit, error } = await findListingByWhatsapp(admin, whatsapp, excludeId);
  if (error) return error;
  return hit ? `That WhatsApp number is already listed as "${hit.name}".` : null;
}

// Hours and category-specific values — the admin-only parts of a listing.
// Field values are checked against the schema of the category the listing is
// being saved into, which is loaded here rather than trusted from the form.
async function parseListingExtras(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  fd: FormData,
  categoryId: string,
): Promise<
  | { hours_json: unknown; fields_values: unknown; error?: undefined }
  | { error: string }
> {
  const hours = parseHoursInput(String(fd.get("hours_json") ?? ""));
  if (hours.error !== undefined) return { error: hours.error };

  const { data: category, error } = await admin
    .from("categories")
    .select("fields_schema")
    .eq("id", categoryId)
    .maybeSingle();
  if (error) return { error: error.message };
  const schema = (category as { fields_schema: FieldDef[] | null } | null)?.fields_schema ?? null;
  const values = parseFieldValuesInput(schema, String(fd.get("fields_values") ?? ""));
  if (values.error !== undefined) return { error: values.error };

  return { hours_json: hours.hours, fields_values: values.values };
}

export async function createListing(
  fd: FormData,
): Promise<{ error?: string; ok?: boolean; id?: string }> {
  const user = await requireAdmin();

  const parsed = parseListingFields(fd);
  if (parsed.error !== undefined) return { error: parsed.error };
  const { fields } = parsed;
  const publish = fd.get("publish") === "on";
  const verified = fd.get("verified") === "on";

  const admin = createSupabaseAdminClient();

  const extras = await parseListingExtras(admin, fd, fields.category_id);
  if (extras.error !== undefined) return { error: extras.error };

  const dupe = await duplicateNumberError(admin, fields.whatsapp_number);
  if (dupe) return { error: dupe };

  const now = new Date().toISOString();
  const inserted = await insertListingWithUniqueSlug(admin, {
    ...fields,
    ...extras,
    status: publish ? "approved" : "pending",
    source: "manual",
    approved_at: publish ? now : null,
    approved_by: publish ? user.id : null,
    verified,
    verified_at: verified ? now : null,
  });
  if (inserted.error !== undefined) return { error: inserted.error };
  const { id } = inserted;

  // Photos follow as their own requests, keyed on this id; each upload
  // revalidates again once it lands.
  if (publish) await revalidateListingById(admin, id);
  else revalidatePath("/admin");
  return { ok: true, id };
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
  revalidatePath("/admin/listings");
  if (!target) return;
  const city = target.neighborhoods?.cities?.slug;
  const hood = target.neighborhoods?.slug;
  const category = target.categories?.slug;
  if (city && hood && category) {
    revalidatePath(`/${city}/${hood}/${category}/${target.slug}`);
    revalidatePath(`/${city}/c/${category}`);
    revalidatePath(`/${city}/n/${hood}`);
  }
  revalidatePath("/sitemap.xml");
}

const REVALIDATE_TARGET_COLUMNS =
  "slug, categories(slug), neighborhoods(slug, cities(slug))";

// Public pages cache for an hour, so any change that alters what they show
// has to purge them here — otherwise an approval or a verified badge would
// take up to that long to appear.
async function revalidateListingById(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  listingId: string,
) {
  const { data } = await admin
    .from("listings")
    .select(REVALIDATE_TARGET_COLUMNS)
    .eq("id", listingId)
    .maybeSingle();
  revalidateListing(data as unknown as RevalidateTarget | null);
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

  // uploadListingPhoto already timestamps the filename, which is what keeps
  // a replacement from colliding with the file it replaces while both
  // briefly exist — passing a timestamp in the kind as well just produced
  // names like cover-1787969010065-1787969010065.png.
  const url = await uploadListingPhoto(admin, listingId, file, kind);
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

  // Photos upload after the record is saved (and revalidated), so without
  // this a new or replaced photo stayed off the public page for up to an hour.
  await revalidateListingById(admin, listingId);
  return { url };
}

export async function updateListing(
  fd: FormData,
): Promise<{ error?: string; ok?: boolean; id?: string }> {
  await requireAdmin();

  const id = String(fd.get("id") ?? "");
  if (!id) return { error: "Missing listing id." };

  const parsed = parseListingFields(fd);
  if (parsed.error !== undefined) return { error: parsed.error };
  const { fields } = parsed;
  const verified = fd.get("verified") === "on";

  const admin = createSupabaseAdminClient();

  const { data: existing, error: loadError } = await admin
    .from("listings")
    .select(`verified, verified_at, gallery_urls, ${REVALIDATE_TARGET_COLUMNS}`)
    .eq("id", id)
    .maybeSingle();
  if (loadError) return { error: loadError.message };
  if (!existing) return { error: "That listing no longer exists." };
  const current = existing as unknown as RevalidateTarget & {
    verified: boolean;
    verified_at: string | null;
    gallery_urls: string[] | null;
  };

  // Gallery images the admin left ticked. Anything already on the listing
  // but missing from this list has been removed in the form. Only URLs the
  // listing already had are honoured, so the form can't add arbitrary ones.
  const currentGallery = current.gallery_urls ?? [];
  const kept = new Set(fd.getAll("keep_gallery").map(String));
  const keptGallery = currentGallery.filter((u) => kept.has(u));

  const extras = await parseListingExtras(admin, fd, fields.category_id);
  if (extras.error !== undefined) return { error: extras.error };

  const dupe = await duplicateNumberError(admin, fields.whatsapp_number, id);
  if (dupe) return { error: dupe };

  const now = new Date().toISOString();
  const { error } = await admin
    .from("listings")
    .update({
      ...fields,
      ...extras,
      verified,
      // Only stamp a fresh verified_at when verification actually flips on,
      // so re-saving a listing doesn't keep moving the date forward.
      verified_at: verified ? (current.verified ? current.verified_at : now) : null,
      gallery_urls: keptGallery,
    })
    .eq("id", id);
  if (error) {
    if (error.code === UNIQUE_VIOLATION)
      return { error: "A listing with this name already exists in that neighborhood." };
    return { error: error.message };
  }

  // Clear out gallery images this edit dropped — only files in our own
  // bucket, and only after the row is safely updated.
  const paths = currentGallery
    .filter((u) => !kept.has(u))
    .map(storagePathFromUrl)
    .filter((p): p is string => !!p);
  if (paths.length > 0) {
    await admin.storage.from("listing-photos").remove(paths);
  }

  // Purge where the listing was AND where it is now: a changed category or
  // neighborhood moves it to different browse pages, and purging only the
  // old ones left it missing from the new ones for up to an hour.
  revalidateListing(current);
  await revalidateListingById(admin, id);
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
    .select(REVALIDATE_TARGET_COLUMNS)
    .eq("id", listingId)
    .maybeSingle();
  const target = row as unknown as RevalidateTarget | null;

  // Row first, images after: if the delete fails the listing keeps its
  // photos instead of surviving without them. The {listingId}/ storage
  // prefix is still known once the row is gone.
  const { error } = await admin.from("listings").delete().eq("id", listingId);
  if (error) {
    console.error("deleteListing failed:", error.message);
    return;
  }
  await deleteListingPhotos(admin, listingId);

  revalidateListing(target);
}

// Name + slug parsing shared by the category and neighborhood forms.
function parseNameAndSlug(
  fd: FormData,
): { name: string; slug: string; error?: undefined } | { error: string } {
  const name = String(fd.get("name") ?? "").trim();
  const slugRaw = String(fd.get("slug") ?? "").trim();
  if (name.length < 2) return { error: "Name is required." };
  const slug = slugify(slugRaw || name);
  if (!slug) return { error: "Could not derive a slug from that name — try adding letters." };
  return { name, slug };
}

// Categories and neighborhoods feed the home page, the sitemap and the cached
// taxonomy (see lib/taxonomy), so adding either purges all three.
function revalidateTaxonomy(adminPath: string) {
  revalidatePath(adminPath);
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  revalidateTag(TAXONOMY_TAG);
}

export async function createCategory(fd: FormData): Promise<{ error?: string; ok?: boolean }> {
  await requireAdmin();

  const parsed = parseNameAndSlug(fd);
  if (parsed.error !== undefined) return { error: parsed.error };
  const { name, slug } = parsed;

  // Icon is auto-assigned from the Lucide set based on the category name —
  // see category-icon-picker.ts. No manual icon input in the admin form.
  const icon = pickCategoryIcon(name);

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("categories").insert({ name, slug, icon });
  if (error) {
    if (error.code === UNIQUE_VIOLATION)
      return { error: `A category with slug "${slug}" already exists.` };
    return { error: error.message };
  }
  revalidateTaxonomy("/admin/categories");
  return { ok: true };
}

export async function createNeighborhood(fd: FormData): Promise<{ error?: string; ok?: boolean }> {
  await requireAdmin();

  const parsed = parseNameAndSlug(fd);
  if (parsed.error !== undefined) return { error: parsed.error };
  const { name, slug } = parsed;

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
    if (error.code === UNIQUE_VIOLATION)
      return { error: `A neighborhood with slug "${slug}" already exists.` };
    return { error: error.message };
  }
  revalidateTaxonomy("/admin/neighborhoods");
  return { ok: true };
}

// Replaces a category's custom-field definitions. Listings keep any values
// stored under a removed field's key; the listing page only renders fields
// the current schema defines, so they simply stop showing.
export async function updateCategoryFields(
  fd: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  await requireAdmin();

  const categoryId = String(fd.get("category_id") ?? "");
  if (!categoryId) return { error: "Missing category id." };
  const parsed = parseFieldsSchemaInput(String(fd.get("fields_schema") ?? ""));
  if (parsed.error !== undefined) return { error: parsed.error };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("categories")
    .update({ fields_schema: parsed.fields })
    .eq("id", categoryId);
  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  // Every listing page in the category renders these fields. Purging the
  // route pattern covers them all without looking each one up.
  revalidatePath("/[city]/[neighborhood]/[category]/[listing]", "page");
  return { ok: true };
}
