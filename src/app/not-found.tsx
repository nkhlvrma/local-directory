import Link from "next/link";
import { Compass, Plus } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";

// Backs every notFound() call — the listing, category and neighborhood pages
// all reach for it. A dead-end 404 on a directory is a wasted visit, so this
// offers search and the submission form rather than just an apology.
export default function NotFound() {
  return (
    <Container className="py-20">
      <div className="mx-auto max-w-md text-center space-y-6">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Compass className="size-6" />
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight font-heading">
            We couldn&apos;t find that page
          </h1>
          <p className="text-sm text-muted-foreground">
            The listing may have moved or been removed. Try searching for it.
          </p>
        </div>
        <SearchBar size="md" />
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
    </Container>
  );
}
