"use client";

import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ListingForm, type EditableListing } from "../../ListingForm";

type Option = { id: string; name: string };

// Mirrors NewListingSheet: a real route that presents as a sheet, closing
// back to the dashboard.
export function EditListingSheet({
  categories,
  neighborhoods,
  listing,
}: {
  categories: Option[];
  neighborhoods: Option[];
  listing: EditableListing;
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
          <SheetTitle>Edit listing</SheetTitle>
          <SheetDescription>
            Changes go live immediately. Photos you remove are deleted on save.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          <ListingForm
            categories={categories}
            neighborhoods={neighborhoods}
            listing={listing}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
