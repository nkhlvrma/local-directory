"use client";

import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { NewListingForm } from "./NewListingForm";

type Option = { id: string; name: string };

// Opens as a sheet on page load rather than sitting inline in the page —
// closing it (X, overlay click, or Esc) goes back to the pending queue.
// Still a real navigable route (/admin/listings/new) for the sidebar CTA
// and for bookmarking/sharing.
export function NewListingSheet({
  categories,
  neighborhoods,
}: {
  categories: Option[];
  neighborhoods: Option[];
}) {
  const router = useRouter();

  return (
    <Sheet
      defaultOpen
      onOpenChange={(open) => {
        if (!open) router.push("/admin");
      }}
    >
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New listing</SheetTitle>
          <SheetDescription>
            Publishes immediately unless you uncheck it below.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          <NewListingForm categories={categories} neighborhoods={neighborhoods} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
