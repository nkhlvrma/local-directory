import { redirect } from "next/navigation";

// Old URL — kept alive so bookmarks/redirects don't 404. Sends to the
// friendlier /admin/insights page.
export default function OldInsightsPage() {
  redirect("/admin/insights");
}
