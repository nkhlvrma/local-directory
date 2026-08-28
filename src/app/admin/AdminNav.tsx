import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "./actions";

export function AdminNav({ active }: { active: "queue" | "reports" }) {
  return (
    <div className="flex items-center justify-between border-b pb-4">
      <nav className="flex gap-4 text-sm font-medium">
        <Link
          href="/admin"
          className={active === "queue" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}
        >
          Pending queue
        </Link>
        <Link
          href="/admin/reports"
          className={active === "reports" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}
        >
          Reports
        </Link>
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
