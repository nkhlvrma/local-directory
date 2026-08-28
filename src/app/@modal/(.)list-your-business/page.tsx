import { ListYourBusinessSheet } from "@/app/list-your-business/ListYourBusinessSheet";

// Intercepted version of /list-your-business — rendered into the @modal
// slot when navigated to via a client-side Link from elsewhere in the app,
// so the page you were on stays mounted (and visible, dimmed) behind the
// sheet. A direct visit or reload bypasses interception and gets the full
// page at src/app/list-your-business/page.tsx instead.
export default function ListYourBusinessModal() {
  return <ListYourBusinessSheet />;
}
