import { ListYourBusinessSheet } from "./ListYourBusinessSheet";

export const revalidate = 3600;

// Full-page fallback: reached by a direct visit or a reload, where the
// intercepting route in @modal/(.)list-your-business doesn't apply.
export default function ListYourBusinessPage() {
  return <ListYourBusinessSheet />;
}
