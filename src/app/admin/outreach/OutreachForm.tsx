"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { createOutreachLead } from "../actions";
import { OptionSelect, type Option } from "./OptionSelect";

export function OutreachForm({
  categories,
  neighborhoods,
}: {
  categories: Option[];
  neighborhoods: Option[];
}) {
  const [pending, startTransition] = useTransition();
  const [categoryId, setCategoryId] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");

  return (
    <form
      className="grid gap-3 border rounded-lg p-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        fd.set("category_id", categoryId);
        fd.set("neighborhood_id", neighborhoodId);
        startTransition(async () => {
          const res = await createOutreachLead(fd);
          if (res.error) toast.error(res.error);
          else {
            toast.success("Lead added");
            form.reset();
            setCategoryId("");
            setNeighborhoodId("");
          }
        });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="lead-name">Business name</Label>
        <Input id="lead-name" name="business_name" required maxLength={80} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="lead-wa">WhatsApp number</Label>
        <Input
          id="lead-wa"
          name="whatsapp_number"
          required
          placeholder="+919812345678"
          pattern="^\+[1-9][0-9]{7,14}$"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Category</Label>
        <OptionSelect options={categories} value={categoryId} onChange={setCategoryId} />
      </div>
      <div className="space-y-1.5">
        <Label>Neighborhood</Label>
        <OptionSelect options={neighborhoods} value={neighborhoodId} onChange={setNeighborhoodId} />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="lead-source">Where you found them (optional)</Label>
        <Input id="lead-source" name="source_note" maxLength={300} placeholder="Google Maps, walked past, referral…" />
      </div>
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner data-icon="inline-start" /> : <Plus className="size-4" data-icon="inline-start" />}
          Add lead
        </Button>
      </div>
    </form>
  );
}
