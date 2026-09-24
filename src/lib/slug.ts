export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    // Trim after the cut, so a slice landing on a separator doesn't leave a
    // trailing hyphen in the URL.
    .replace(/^-|-$/g, "");
}
