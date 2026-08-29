"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, AlertTriangle, Send, X } from "lucide-react";
import { toast } from "sonner";
import { createListing, updateListing } from "../actions";

type Option = { id: string; name: string };

export type EditableListing = {
  id: string;
  name: string;
  description: string | null;
  whatsapp_number: string;
  pin_code: string | null;
  category_id: string;
  neighborhood_id: string;
  verified: boolean;
  photo_url: string | null;
  cover_photo_url: string | null;
  gallery_urls: string[] | null;
};

// One form for both creating and editing. The fields are identical; only
// the defaults, the photo handling and the action differ, and keeping them
// in one place is what stops the two drifting apart as fields get added.
export function ListingForm({
  categories,
  neighborhoods,
  listing,
}: {
  categories: Option[];
  neighborhoods: Option[];
  listing?: EditableListing;
}) {
  const editing = !!listing;

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [categoryId, setCategoryId] = useState(listing?.category_id ?? "");
  const [neighborhoodId, setNeighborhoodId] = useState(listing?.neighborhood_id ?? "");
  // Existing gallery images the admin hasn't removed. Submitted as
  // keep_gallery so the server knows what to retain; anything dropped here
  // gets deleted from storage on save.
  const [keptGallery, setKeptGallery] = useState<string[]>(listing?.gallery_urls ?? []);

  if (done && !editing) {
    return (
      <Alert className="flex items-center gap-2.5">
        <CheckCircle2 className="size-4 text-green-600 shrink-0" />
        <AlertDescription className="flex flex-1 items-center justify-between gap-4">
          <span>Listing created.</span>
          <Button size="sm" variant="outline" onClick={() => setDone(false)}>
            Add another
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const form = e.currentTarget;
        const fd = new FormData(form);
        fd.set("category_id", categoryId);
        fd.set("neighborhood_id", neighborhoodId);
        if (listing) fd.set("id", listing.id);
        startTransition(async () => {
          const res = listing ? await updateListing(fd) : await createListing(fd);
          if (res?.error) {
            setError(res.error);
            toast.error(res.error);
            return;
          }
          toast.success(editing ? "Listing saved" : "Listing created");
          if (editing) {
            setDone(true);
          } else {
            setDone(true);
            setCategoryId("");
            setNeighborhoodId("");
            form.reset();
          }
        });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="name">Business name</Label>
        <Input id="name" name="name" required maxLength={80} defaultValue={listing?.name ?? ""} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId} required>
            <SelectTrigger>
              <SelectValue placeholder="Choose one" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Neighborhood</Label>
          <Select value={neighborhoodId} onValueChange={setNeighborhoodId} required>
            <SelectTrigger>
              <SelectValue placeholder="Choose one" />
            </SelectTrigger>
            <SelectContent>
              {neighborhoods.map((n) => (
                <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp_number">WhatsApp number</Label>
          <Input
            id="whatsapp_number"
            name="whatsapp_number"
            required
            placeholder="+919812345678"
            pattern="^\+[1-9][0-9]{7,14}$"
            defaultValue={listing?.whatsapp_number ?? ""}
          />
          <p className="text-xs text-muted-foreground">With country code, e.g. +9198…</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pin_code">PIN code (optional)</Label>
          <Input
            id="pin_code"
            name="pin_code"
            placeholder="226010"
            inputMode="numeric"
            maxLength={6}
            pattern="[1-9][0-9]{5}"
            defaultValue={listing?.pin_code ?? ""}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Short description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          maxLength={300}
          defaultValue={listing?.description ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="cover_photo">Cover photo{editing ? " (replace)" : " (optional)"}</Label>
          <Input id="cover_photo" name="cover_photo" type="file" accept="image/*" />
          <p className="text-xs text-muted-foreground">
            Landscape — detail page hero. JPG/PNG, under 5MB.
          </p>
          {listing?.cover_photo_url ? <ExistingThumb src={listing.cover_photo_url} /> : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="photo">Grid photo{editing ? " (replace)" : " (optional)"}</Label>
          <Input id="photo" name="photo" type="file" accept="image/*" />
          <p className="text-xs text-muted-foreground">
            Portrait — used in listing cards. JPG/PNG, under 5MB.
          </p>
          {listing?.photo_url ? <ExistingThumb src={listing.photo_url} /> : null}
        </div>
      </div>

      {editing && keptGallery.length > 0 ? (
        <div className="space-y-1.5">
          <Label>Current gallery photos</Label>
          <div className="flex flex-wrap gap-2">
            {keptGallery.map((url) => (
              <div key={url} className="relative">
                <input type="hidden" name="keep_gallery" value={url} />
                <ExistingThumb src={url} />
                <Button
                  type="button"
                  size="icon-xs"
                  variant="secondary"
                  aria-label="Remove this photo"
                  className="absolute -top-1.5 -right-1.5 rounded-full"
                  onClick={() => setKeptGallery((g) => g.filter((u) => u !== url))}
                >
                  <X />
                </Button>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Removed photos are deleted when you save.
          </p>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="gallery">
          {editing ? "Add gallery photos" : "Gallery photos (optional)"}
        </Label>
        <Input id="gallery" name="gallery" type="file" accept="image/*" multiple />
        <p className="text-xs text-muted-foreground">
          Up to 4 extra photos for the detail-page carousel — the cover photo
          leads, so the carousel shows 5 in total. JPG/PNG, under 5MB each.
          {editing ? ` ${keptGallery.length} of 4 used.` : ""}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {/* Publishing is a create-time choice; an existing listing's status
            is managed from the queue's approve/reject actions instead. */}
        {editing ? null : (
          <div className="flex items-center gap-2.5">
            <Switch id="publish" name="publish" defaultChecked />
            <Label htmlFor="publish" className="font-normal">
              Publish immediately (skip pending queue)
            </Label>
          </div>
        )}
        <div className="flex items-center gap-2.5">
          <Switch id="verified" name="verified" defaultChecked={listing?.verified ?? false} />
          <Label htmlFor="verified" className="font-normal">
            Mark as verified
          </Label>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Send className="size-4" data-icon="inline-start" />
          )}
          {pending
            ? editing
              ? "Saving…"
              : "Creating…"
            : editing
              ? "Save changes"
              : "Create listing"}
        </Button>
        {editing && done && !pending ? (
          <span className="text-sm text-muted-foreground">Saved.</span>
        ) : null}
      </div>
    </form>
  );
}

function ExistingThumb({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={64}
      height={64}
      className="size-16 rounded-md object-cover border"
    />
  );
}
