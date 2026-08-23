"use client";

import { useState, useTransition } from "react";
import {
  TextField,
  TextArea,
  Select,
  Button,
  Flex,
  Text,
  Callout,
} from "@radix-ui/themes";
import { CheckCircledIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
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
      <Callout.Root color="grass">
        <Callout.Icon>
          <CheckCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          Thanks — your listing has been submitted for review.
        </Callout.Text>
      </Callout.Root>
    );
  }

  return (
    <form
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
      <Flex direction="column" gap="3">
        <Field label="Business name">
          <TextField.Root name="name" required maxLength={80} />
        </Field>

        <Field label="WhatsApp number (with country code, e.g. +9198…)">
          <TextField.Root
            name="whatsapp_number"
            required
            placeholder="+919812345678"
            pattern="^\+[1-9][0-9]{7,14}$"
          />
        </Field>

        <Field label="Category">
          <Select.Root value={categoryId} onValueChange={setCategoryId} required>
            <Select.Trigger placeholder="Choose one" />
            <Select.Content>
              {categories.map((c) => (
                <Select.Item key={c.id} value={c.id}>
                  {c.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Field>

        <Field label="Neighborhood">
          <Select.Root value={neighborhoodId} onValueChange={setNeighborhoodId} required>
            <Select.Trigger placeholder="Choose one" />
            <Select.Content>
              {neighborhoods.map((n) => (
                <Select.Item key={n.id} value={n.id}>
                  {n.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Field>

        <Field label="PIN code (optional, 6 digits)">
          <TextField.Root
            name="pin_code"
            placeholder="226010"
            inputMode="numeric"
            maxLength={6}
            pattern="[1-9][0-9]{5}"
          />
        </Field>

        <Field label="Short description (optional)">
          <TextArea name="description" rows={3} maxLength={300} />
        </Field>

        <Turnstile />

        {error ? (
          <Callout.Root color="red">
            <Callout.Icon>
              <ExclamationTriangleIcon />
            </Callout.Icon>
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        ) : null}

        <div>
          <Button type="submit" disabled={pending}>
            {pending ? "Submitting…" : "Submit for review"}
          </Button>
        </div>
      </Flex>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <Text as="div" size="1" color="gray" weight="medium" mb="1">
        {label}
      </Text>
      {children}
    </label>
  );
}
