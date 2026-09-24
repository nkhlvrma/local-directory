import { getSubmissionOptions } from "@/lib/taxonomy";
import { SubmitFormSheet } from "./SubmitFormSheet";

// Shared by both entry points into the submit form: the intercepted @modal
// route (sheet drawn over whatever page you clicked "List your business"
// from) and the plain page at /list-your-business that a direct visit or a
// reload falls back to. Both need exactly the same category/neighborhood
// options, so the fetch lives here instead of being spelled out in both
// route files — they now differ only in the route-level config each needs.
//
// The options come from the shared cache rather than a fresh query per
// render: they are the same for every visitor and change only when an admin
// edits them, which purges the cache by tag.
export async function ListYourBusinessSheet() {
  const { categories, neighborhoods } = await getSubmissionOptions();

  return (
    <SubmitFormSheet categories={categories} neighborhoods={neighborhoods} />
  );
}
