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

// Used both as the intercepted @modal route (sheet on top of whatever page
// you clicked "List your business" from) and as the full-page fallback for
// a direct visit/reload — router.back() is the right close behavior for
// both: it dismisses the sheet back to the real previous page when
// intercepted, and is a reasonable no-op-ish fallback (leaves the site or
// falls through to browser history) otherwise.
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
        if (!open) router.back();
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
