"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DAYS, DAY_LABEL, type Day } from "@/lib/hours";
import type { WeekHours, FieldDef, DayHours } from "@/lib/types";
import { updateListing } from "./actions";

type Category = {
  id: string;
  name: string;
  slug: string;
  fields_schema: FieldDef[] | null;
};
type Listing = {
  id: string;
  name: string;
  description: string | null;
  whatsapp_number: string;
  category_id: string;
  neighborhood_id: string;
  pin_code: string | null;
  photo_url: string | null;
  hours_json: WeekHours | null;
  verified: boolean;
  status: string;
  fields_values: Record<string, string | number | boolean | null> | null;
};

export function EditForm({
  listing,
  categories,
  neighborhoods,
}: {
  listing: Listing;
  categories: Category[];
  neighborhoods: { id: string; name: string }[];
}) {
  const [name, setName] = useState(listing.name);
  const [description, setDescription] = useState(listing.description ?? "");
  const [whatsapp, setWhatsapp] = useState(listing.whatsapp_number);
  const [categoryId, setCategoryId] = useState(listing.category_id);
  const [neighborhoodId, setNeighborhoodId] = useState(listing.neighborhood_id);
  const [pin, setPin] = useState(listing.pin_code ?? "");
  const [photoUrl, setPhotoUrl] = useState(listing.photo_url ?? "");
  const [verified, setVerified] = useState(listing.verified);
  const [hours, setHours] = useState<WeekHours>(listing.hours_json ?? {});
  const [fields, setFields] = useState<Record<string, string | number | boolean | null>>(
    listing.fields_values ?? {},
  );
  const [status, setStatus] = useState<string>(listing.status);
  const [pending, startTransition] = useTransition();

  const category = categories.find((c) => c.id === categoryId);
  const schema = category?.fields_schema ?? [];

  function updateHour(day: Day, patch: Partial<NonNullable<DayHours>>) {
    setHours((h) => {
      const current = h[day] ?? { open: "09:00", close: "18:00" };
      return { ...h, [day]: { ...current, ...patch } };
    });
  }
  function closeDay(day: Day) {
    setHours((h) => ({ ...h, [day]: null }));
  }
  function openDay(day: Day) {
    setHours((h) => ({ ...h, [day]: { open: "09:00", close: "18:00" } }));
  }

  function submit() {
    startTransition(async () => {
      const res = await updateListing({
        id: listing.id,
        name,
        description: description || null,
        whatsapp_number: whatsapp,
        category_id: categoryId,
        neighborhood_id: neighborhoodId,
        pin_code: pin || null,
        photo_url: photoUrl || null,
        hours_json: Object.keys(hours).length ? hours : null,
        verified,
        status,
        fields_values: Object.keys(fields).length ? fields : null,
      });
      if (res?.error) toast.error(res.error);
      else toast("Saved");
    });
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <FieldRow label="Business name">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </FieldRow>
        <FieldRow label="WhatsApp (E.164)">
          <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </FieldRow>
        <FieldRow label="Category">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="Neighborhood">
          <Select value={neighborhoodId} onValueChange={setNeighborhoodId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {neighborhoods.map((n) => (
                <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="PIN code (6 digits, optional)">
          <Input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="226010"
            inputMode="numeric"
          />
        </FieldRow>
        <FieldRow label="Description">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </FieldRow>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="font-medium">Photo</div>
        <FieldRow label="Image URL (paste from anywhere — Supabase Storage upload coming when project is connected)">
          <Input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://…" />
        </FieldRow>
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="" style={{ maxHeight: 180 }} className="rounded-md" />
        ) : null}
      </Card>

      <Card className="p-4 space-y-3">
        <div className="font-medium">Hours (Asia/Kolkata)</div>
        <div className="space-y-2">
          {DAYS.map((d) => {
            const day = hours[d] ?? null;
            const open = day !== null;
            return (
              <div key={d} className="flex items-center gap-3">
                <div className="w-10 text-sm font-medium">{DAY_LABEL[d]}</div>
                <Switch checked={open} onCheckedChange={(v) => (v ? openDay(d) : closeDay(d))} />
                {open ? (
                  <>
                    <Input
                      type="time"
                      value={day?.open ?? "09:00"}
                      onChange={(e) => updateHour(d, { open: e.target.value })}
                      className="w-28"
                    />
                    <span className="text-xs text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={day?.close ?? "18:00"}
                      onChange={(e) => updateHour(d, { close: e.target.value })}
                      className="w-28"
                    />
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Closed</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {schema.length > 0 ? (
        <Card className="p-4 space-y-3">
          <div className="font-medium">{category?.name} details</div>
          {schema.map((f) => (
            <FieldRow key={f.key} label={f.label}>
              {f.type === "boolean" ? (
                <Switch
                  checked={!!fields[f.key]}
                  onCheckedChange={(v) => setFields((s) => ({ ...s, [f.key]: v }))}
                />
              ) : f.type === "select" ? (
                <Select
                  value={String(fields[f.key] ?? "")}
                  onValueChange={(v) => setFields((s) => ({ ...s, [f.key]: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    {(f.options ?? []).map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={f.type === "number" ? "number" : "text"}
                  value={String(fields[f.key] ?? "")}
                  onChange={(e) =>
                    setFields((s) => ({
                      ...s,
                      [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value,
                    }))
                  }
                />
              )}
            </FieldRow>
          ))}
        </Card>
      ) : null}

      <Card className="p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Switch checked={verified} onCheckedChange={setVerified} />
            <span className="text-sm">Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status</span>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">pending</SelectItem>
                <SelectItem value="approved">approved</SelectItem>
                <SelectItem value="rejected">rejected</SelectItem>
                <SelectItem value="removed">removed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Button onClick={submit} disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
