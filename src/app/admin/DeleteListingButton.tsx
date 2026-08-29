"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteListing } from "./actions";

// Deleting is irreversible and removes the listing's photos with it, so it
// goes through a confirmation naming the listing rather than being a single
// misclick next to the verify button.
export function DeleteListingButton({
  listingId,
  listingName,
}: {
  listingId: string;
  listingName: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          aria-label={`Delete ${listingName}`}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{listingName}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the listing and its photos. Reports filed
            against it go too. Analytics already recorded are kept. This can&apos;t
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={(e) => {
              // Keep the dialog up while the delete is in flight, so the
              // row doesn't vanish before the server confirms.
              e.preventDefault();
              startTransition(async () => {
                await deleteListing(listingId);
                toast.success(`Deleted “${listingName}”`);
              });
            }}
          >
            {pending ? <Spinner data-icon="inline-start" /> : null}
            {pending ? "Deleting…" : "Delete listing"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
