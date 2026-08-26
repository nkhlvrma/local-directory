"use client";

import { useState, useTransition } from "react";
import {
  Card,
  Flex,
  TextField,
  TextArea,
  Select,
  Button,
  Text,
  Callout,
  Switch,
  Heading,
} from "@radix-ui/themes";
import { CheckCircledIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
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

const inputClass = ""; // Radix TextField owns its own styles

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
  const [fields, setFields] = useState<
    Record<string, string | number | boolean | null>
  >(listing.fields_values ?? {});
  const [status, setStatus] = useState<string>(listing.status);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const category = categories.find((c) => c.id === categoryId);
  const schema = category?.fields_schema ?? [];

  function updateHour(day: Day, patch: Partial<DayHours>) {
    setHours((h) => {
      const current = h[day] ?? { open: "09:00", close: "18:00" };
      return {
        ...h,
        [day]: { ...current, ...(patch ?? {}) },
      };
    });
  }
  function closeDay(day: Day) {
    setHours((h) => ({ ...h, [day]: null }));
  }
  function openDay(day: Day) {
    setHours((h) => ({ ...h, [day]: { open: "09:00", close: "18:00" } }));
  }

  function submit() {
    setError(null);
    setSaved(false);
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
      if (res?.error) setError(res.error);
      else setSaved(true);
    });
  }

  return (
    <Flex direction="column" gap="4">
      <Card size="2">
        <Flex direction="column" gap="3">
          <Field label="Business name">
            <TextField.Root value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="WhatsApp (E.164)">
            <TextField.Root value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </Field>
          <Field label="Category">
            <Select.Root value={categoryId} onValueChange={setCategoryId}>
              <Select.Trigger />
              <Select.Content>
                {categories.map((c) => (
                  <Select.Item key={c.id} value={c.id}>{c.name}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Field>
          <Field label="Neighborhood">
            <Select.Root value={neighborhoodId} onValueChange={setNeighborhoodId}>
              <Select.Trigger />
              <Select.Content>
                {neighborhoods.map((n) => (
                  <Select.Item key={n.id} value={n.id}>{n.name}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Field>
          <Field label="PIN code (6 digits, optional)">
            <TextField.Root
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="226010"
              inputMode="numeric"
            />
          </Field>
          <Field label="Description">
            <TextArea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </Field>
        </Flex>
      </Card>

      <Card size="2">
        <Heading size="3" mb="2">Photo</Heading>
        <Field label="Image URL (paste from anywhere; file upload coming with Supabase Storage)">
          <TextField.Root
            className={inputClass}
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://…"
          />
        </Field>
        {photoUrl ? (
          <div style={{ marginTop: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl} alt="" style={{ maxWidth: "100%", maxHeight: 180, borderRadius: 8 }} />
          </div>
        ) : null}
      </Card>

      <Card size="2">
        <Heading size="3" mb="2">Hours (Asia/Kolkata)</Heading>
        <Flex direction="column" gap="2">
          {DAYS.map((d) => {
            const day = hours[d] ?? null;
            const open = day !== null;
            return (
              <Flex key={d} align="center" gap="3">
                <div style={{ width: 40 }}>
                  <Text size="2" weight="medium">{DAY_LABEL[d]}</Text>
                </div>
                <Switch
                  checked={open}
                  onCheckedChange={(v) => (v ? openDay(d) : closeDay(d))}
                />
                {open ? (
                  <>
                    <TextField.Root
                      type="time"
                      value={day?.open ?? "09:00"}
                      onChange={(e) => updateHour(d, { open: e.target.value })}
                    />
                    <Text size="1" color="gray">to</Text>
                    <TextField.Root
                      type="time"
                      value={day?.close ?? "18:00"}
                      onChange={(e) => updateHour(d, { close: e.target.value })}
                    />
                  </>
                ) : (
                  <Text size="2" color="gray">Closed</Text>
                )}
              </Flex>
            );
          })}
        </Flex>
      </Card>

      {schema.length > 0 ? (
        <Card size="2">
          <Heading size="3" mb="2">{category?.name} details</Heading>
          <Flex direction="column" gap="3">
            {schema.map((f) => (
              <Field key={f.key} label={f.label}>
                {f.type === "boolean" ? (
                  <Switch
                    checked={!!fields[f.key]}
                    onCheckedChange={(v) => setFields((s) => ({ ...s, [f.key]: v }))}
                  />
                ) : f.type === "select" ? (
                  <Select.Root
                    value={String(fields[f.key] ?? "")}
                    onValueChange={(v) => setFields((s) => ({ ...s, [f.key]: v }))}
                  >
                    <Select.Trigger placeholder="—" />
                    <Select.Content>
                      {(f.options ?? []).map((o) => (
                        <Select.Item key={o} value={o}>{o}</Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                ) : (
                  <TextField.Root
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
              </Field>
            ))}
          </Flex>
        </Card>
      ) : null}

      <Card size="2">
        <Flex align="center" justify="between" gap="3" wrap="wrap">
          <Flex align="center" gap="2">
            <Switch checked={verified} onCheckedChange={setVerified} />
            <Text size="2">Verified</Text>
          </Flex>
          <Flex align="center" gap="2">
            <Text size="2" color="gray">Status</Text>
            <Select.Root value={status} onValueChange={setStatus}>
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="pending">pending</Select.Item>
                <Select.Item value="approved">approved</Select.Item>
                <Select.Item value="rejected">rejected</Select.Item>
                <Select.Item value="removed">removed</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>
        </Flex>
      </Card>

      {error ? (
        <Callout.Root color="red">
          <Callout.Icon><ExclamationTriangleIcon /></Callout.Icon>
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      ) : null}
      {saved ? (
        <Callout.Root color="grass">
          <Callout.Icon><CheckCircledIcon /></Callout.Icon>
          <Callout.Text>Saved.</Callout.Text>
        </Callout.Root>
      ) : null}

      <Flex gap="2">
        <Button onClick={submit} disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </Flex>
    </Flex>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      <Text as="div" size="1" color="gray" weight="medium" mb="1">
        {label}
      </Text>
      {children}
    </label>
  );
}
