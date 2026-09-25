"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FieldDef, FieldType } from "@/lib/types";
import { updateCategoryFields } from "../actions";

// Rows keep options as the raw comma-separated text while editing; the server
// splits, trims and de-duplicates it (parseFieldsSchemaInput). `key` is only
// present on fields that already exist, so renaming a label doesn't orphan
// values listings have stored under the old key.
type Row = {
  id: number;
  key?: string;
  label: string;
  type: FieldType;
  options: string;
  help: string;
};

const TYPE_LABEL: Record<FieldType, string> = {
  text: "Text",
  number: "Number",
  boolean: "Yes / no",
  select: "Choice",
};

let nextId = 0;

function toRows(fields: FieldDef[] | null): Row[] {
  return (fields ?? []).map((f) => ({
    id: nextId++,
    key: f.key,
    label: f.label,
    type: f.type,
    options: (f.options ?? []).join(", "),
    help: f.help ?? "",
  }));
}

export function CategoryFieldsEditor({
  categoryId,
  initial,
}: {
  categoryId: string;
  initial: FieldDef[] | null;
}) {
  const [rows, setRows] = useState(() => toRows(initial));
  const [pending, startTransition] = useTransition();

  const update = (id: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const save = () => {
    const fd = new FormData();
    fd.set("category_id", categoryId);
    fd.set(
      "fields_schema",
      JSON.stringify(
        rows.map((r) => ({
          key: r.key,
          label: r.label,
          type: r.type,
          options: r.type === "select" ? r.options.split(",") : undefined,
          help: r.help,
        })),
      ),
    );
    startTransition(async () => {
      const res = await updateCategoryFields(fd);
      if (res.error) toast.error(res.error);
      else toast.success("Fields saved");
    });
  };

  return (
    <div className="space-y-3">
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No custom fields. Add some to capture details specific to this category, like
          price per meal or home delivery.
        </p>
      ) : null}
      {rows.map((r) => (
        <div key={r.id} className="grid gap-2 sm:grid-cols-[1fr_8rem_auto] items-start">
          <Input
            value={r.label}
            placeholder="Label, e.g. Price per meal"
            maxLength={60}
            onChange={(e) => update(r.id, { label: e.target.value })}
            aria-label="Field label"
          />
          <Select value={r.type} onValueChange={(t) => update(r.id, { type: t as FieldType })}>
            <SelectTrigger aria-label="Field type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(TYPE_LABEL) as FieldType[]).map((t) => (
                <SelectItem key={t} value={t}>
                  {TYPE_LABEL[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Remove field"
            onClick={() => setRows((prev) => prev.filter((x) => x.id !== r.id))}
          >
            <Trash2 className="size-4" />
          </Button>
          {r.type === "select" ? (
            <Input
              className="sm:col-span-2"
              value={r.options}
              placeholder="Options, comma-separated: Veg, Non-veg, Both"
              onChange={(e) => update(r.id, { options: e.target.value })}
              aria-label="Options"
            />
          ) : null}
          <Input
            className="sm:col-span-2"
            value={r.help}
            placeholder="Help text for admins (optional)"
            maxLength={120}
            onChange={(e) => update(r.id, { help: e.target.value })}
            aria-label="Help text"
          />
        </div>
      ))}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            setRows((prev) => [
              ...prev,
              { id: nextId++, label: "", type: "text", options: "", help: "" },
            ])
          }
        >
          <Plus className="size-4" data-icon="inline-start" />
          Add field
        </Button>
        <Button type="button" size="sm" onClick={save} disabled={pending}>
          {pending ? <Spinner data-icon="inline-start" /> : null}
          {pending ? "Saving…" : "Save fields"}
        </Button>
      </div>
    </div>
  );
}
