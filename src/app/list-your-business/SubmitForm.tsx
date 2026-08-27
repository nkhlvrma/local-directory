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
import { CheckCircle2, AlertTriangle, User, MessageCircle, Home, Send } from "lucide-react";
import { submitListing } from "./actions";
import { Turnstile } from "@/components/Turnstile";

type Option = { id: string; name: string };

export function SubmitForm({
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
      <Alert>
        <CheckCircle2 className="size-4 text-green-600" />
        <AlertDescription>
          Thanks — your listing has been submitted for review.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget);
        fd.set("category_id", categoryId);
        fd.set("neighborhood_id", neighborhoodId);
        startTransition(async () => {
          const res = await submitListing(fd);
          if (res?.error) setError(res.error);
          else setDone(true);
        });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="name">Business name</Label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input id="name" name="name" required maxLength={80} className="pl-9" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="whatsapp_number">WhatsApp (with country code)</Label>
        <div className="relative">
          <MessageCircle className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="whatsapp_number"
            name="whatsapp_number"
            required
            placeholder="+919812345678"
            pattern="^\+[1-9][0-9]{7,14}$"
            className="pl-9"
          />
        </div>
      </div>

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

      <div className="space-y-1.5">
        <Label htmlFor="pin_code">PIN code (optional)</Label>
        <div className="relative">
          <Home className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="pin_code"
            name="pin_code"
            placeholder="226010"
            inputMode="numeric"
            maxLength={6}
            pattern="[1-9][0-9]{5}"
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Short description (optional)</Label>
        <Textarea id="description" name="description" rows={3} maxLength={300} />
      </div>

      <Turnstile />

      {error ? (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" disabled={pending}>
        <Send className="size-4" />
        {pending ? "Submitting…" : "Submit for review"}
      </Button>
    </form>
  );
}
