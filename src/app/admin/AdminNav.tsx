import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "./actions";

type Tab = "queue" | "reports" | "new-listing" | "categories" | "neighborhoods";

const TABS: { key: Tab; href: string; label: string }[] = [
  { key: "queue", href: "/admin", label: "Pending queue" },
  { key: "reports", href: "/admin/reports", label: "Reports" },
  { key: "new-listing", href: "/admin/listings/new", label: "+ New listing" },
  { key: "categories", href: "/admin/categories", label: "Categories" },
  { key: "neighborhoods", href: "/admin/neighborhoods", label: "Neighborhoods" },
];

export function AdminNav({ active }: { active: Tab }) {
  return (
    <div className="flex items-center justify-between border-b pb-4 flex-wrap gap-3">
      <nav className="flex gap-4 text-sm font-medium flex-wrap">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={active === t.key ? "text-foreground" : "text-muted-foreground hover:text-foreground"}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <form action={signOut}>
        <Button type="submit" variant="ghost" size="sm">
          <LogOut className="size-4" />
          Sign out
        </Button>
      </form>
    </div>
  );
}
