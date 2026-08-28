"use client";

import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { SubmitForm } from "./SubmitForm";

type Option = { id: string; name: string };

// Same treatment as the admin "new listing" sheet — opens on page load,
// closing it goes back to the homepage. Still a real route
// (/list-your-business) for links and bookmarking.
export function SubmitFormSheet({
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
        if (!open) router.push("/");
      }}
    >
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>List your business</SheetTitle>
          <SheetDescription>
            Free — we review every submission by hand, usually within a day. No fees, no
            commissions.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          <SubmitForm categories={categories} neighborhoods={neighborhoods} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
