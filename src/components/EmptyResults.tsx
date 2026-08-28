import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Suggestion = { name: string; href: string };

// Shared zero-result empty state for /search, /[city]/c/[category] and
// /[city]/n/[neighborhood]: explains why nothing showed up, offers a couple
// of other categories to try, and a way to close the gap (list a business).
export function EmptyResults({
  heading,
  suggestions = [],
}: {
  heading: string;
  suggestions?: Suggestion[];
}) {
  return (
    <div className="py-10 text-center space-y-5">
      <p className="text-sm text-muted-foreground">{heading}</p>

      {suggestions.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Try one of these instead
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((s) => (
              <Link key={s.href} href={s.href}>
                <Badge
                  variant="outline"
                  className="px-3 py-1.5 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors"
                >
                  {s.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="pt-1">
        <p className="text-xs text-muted-foreground mb-2">
          Know a business that should be here?
        </p>
        <Link href="/list-your-business">
          <Button size="sm">
            <Plus className="size-3.5" />
            List your business
          </Button>
        </Link>
      </div>
    </div>
  );
}
