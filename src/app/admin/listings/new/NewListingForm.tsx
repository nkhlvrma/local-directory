"use client";

import { useState, useTransition } from "react";
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
import { CheckCircle2, AlertTriangle, Send } from "lucide-react";
import { toast } from "sonner";
import { createListing } from "../../actions";

type Option = { id: string; name: string };

export function NewListingForm({
  categories,
  neighborhoods,
}: {
  categories: Option[];
  neighborhoods: Option[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");

  if (done) {
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
        const fd = new FormData(e.currentTarget);
        fd.set("category_id", categoryId);
        fd.set("neighborhood_id", neighborhoodId);
        startTransition(async () => {
          const res = await createListing(fd);
          if (res?.error) {
            setError(res.error);
            toast.error(res.error);
          } else {
            setDone(true);
            setCategoryId("");
            setNeighborhoodId("");
            (e.target as HTMLFormElement).reset();
            toast.success("Listing created");
          }
        });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="name">Business name</Label>
        <Input id="name" name="name" required maxLength={80} />
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
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Short description</Label>
        <Textarea id="description" name="description" rows={3} maxLength={300} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="cover_photo">Cover photo (optional)</Label>
          <Input id="cover_photo" name="cover_photo" type="file" accept="image/*" />
          <p className="text-xs text-muted-foreground">
            Landscape — detail page hero. JPG/PNG, under 5MB.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="photo">Grid photo (optional)</Label>
          <Input id="photo" name="photo" type="file" accept="image/*" />
          <p className="text-xs text-muted-foreground">
            Portrait — used in listing cards. JPG/PNG, under 5MB.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <Switch id="publish" name="publish" defaultChecked />
          <Label htmlFor="publish" className="font-normal">
            Publish immediately (skip pending queue)
          </Label>
        </div>
        <div className="flex items-center gap-2.5">
          <Switch id="verified" name="verified" />
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

      <Button type="submit" disabled={pending}>
        {pending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <Send className="size-4" data-icon="inline-start" />
        )}
        {pending ? "Creating…" : "Create listing"}
      </Button>
    </form>
  );
}
