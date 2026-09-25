"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  deleteCategory,
  deleteNeighborhood,
  renameCategory,
  updateNeighborhood,
} from "./actions";

type Props =
  | { kind: "category"; id: string; name: string }
  | {
      kind: "neighborhood";
      id: string;
      name: string;
      latitude: number | null;
      longitude: number | null;
    };

// Edit and delete controls for one category or neighborhood row. Neighborhoods
// also carry map coordinates — without them the home-page map has no pin.
export function TaxonomyItemActions(props: Props) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const noun = props.kind === "category" ? "category" : "neighborhood";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          aria-label={`Edit ${props.name}`}
          onClick={() => setEditing((e) => !e)}
        >
          <Pencil className="size-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              aria-label={`Delete ${props.name}`}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete “{props.name}”?</AlertDialogTitle>
              <AlertDialogDescription>
                Only possible when no listings use this {noun}. Its public page stops
                existing. This can&apos;t be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={pending}
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={(e) => {
                  e.preventDefault();
                  startTransition(async () => {
                    const res =
                      props.kind === "category"
                        ? await deleteCategory(props.id)
                        : await deleteNeighborhood(props.id);
                    if (res.error) toast.error(res.error);
                    else toast.success(`Deleted “${props.name}”`);
                  });
                }}
              >
                {pending ? <Spinner data-icon="inline-start" /> : null}
                {pending ? "Deleting…" : `Delete ${noun}`}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {editing ? (
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            fd.set("id", props.id);
            startTransition(async () => {
              const res =
                props.kind === "category" ? await renameCategory(fd) : await updateNeighborhood(fd);
              if (res.error) toast.error(res.error);
              else {
                toast.success("Saved");
                setEditing(false);
              }
            });
          }}
        >
          <div className="space-y-1">
            <Label htmlFor={`name-${props.id}`} className="text-xs">
              Name
            </Label>
            <Input
              id={`name-${props.id}`}
              name="name"
              defaultValue={props.name}
              required
              maxLength={60}
              className="h-8 w-44"
            />
          </div>
          {props.kind === "neighborhood" ? (
            <>
              <div className="space-y-1">
                <Label htmlFor={`lat-${props.id}`} className="text-xs">
                  Latitude
                </Label>
                <Input
                  id={`lat-${props.id}`}
                  name="latitude"
                  inputMode="decimal"
                  defaultValue={props.latitude ?? ""}
                  placeholder="30.3165"
                  className="h-8 w-28"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`lng-${props.id}`} className="text-xs">
                  Longitude
                </Label>
                <Input
                  id={`lng-${props.id}`}
                  name="longitude"
                  inputMode="decimal"
                  defaultValue={props.longitude ?? ""}
                  placeholder="78.0322"
                  className="h-8 w-28"
                />
              </div>
            </>
          ) : null}
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? <Spinner data-icon="inline-start" /> : null}
            Save
          </Button>
          <p className="w-full text-xs text-muted-foreground">
            The URL slug stays the same, so existing links keep working.
          </p>
        </form>
      ) : null}
    </div>
  );
}
