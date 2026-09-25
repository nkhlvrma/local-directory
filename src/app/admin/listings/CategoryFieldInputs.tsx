"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FieldValue } from "@/lib/category-fields";
import type { FieldDef } from "@/lib/types";

// Inputs for the selected category's custom fields, submitted as one JSON
// field (fields_values). The server re-checks them against the category's
// schema, so switching category and leaving stale keys behind is harmless —
// they're dropped on save.
export function CategoryFieldInputs({
  schema,
  initial,
}: {
  schema: FieldDef[] | null;
  initial: Record<string, FieldValue | null> | null;
}) {
  const [values, setValues] = useState<Record<string, FieldValue | null>>(initial ?? {});
  const set = (key: string, v: FieldValue | null) => setValues((prev) => ({ ...prev, [key]: v }));

  return (
    <>
      <input type="hidden" name="fields_values" value={JSON.stringify(values)} />
      {schema?.length ? (
        <div className="space-y-3 rounded-lg border p-3">
          <p className="text-sm font-medium">Category details</p>
          <div className="grid grid-cols-2 gap-4">
            {schema.map((f) => {
              const id = `field-${f.key}`;
              const v = values[f.key];
              return (
                <div key={f.key} className="space-y-1.5">
                  <Label htmlFor={id}>{f.label}</Label>
                  {f.type === "boolean" ? (
                    <div className="flex h-9 items-center">
                      <Switch id={id} checked={v === true} onCheckedChange={(c) => set(f.key, c)} />
                    </div>
                  ) : f.type === "select" ? (
                    <Select value={typeof v === "string" ? v : ""} onValueChange={(o) => set(f.key, o)}>
                      <SelectTrigger id={id}>
                        <SelectValue placeholder="Not specified" />
                      </SelectTrigger>
                      <SelectContent>
                        {(f.options ?? []).map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={id}
                      type={f.type === "number" ? "number" : "text"}
                      step="any"
                      maxLength={200}
                      value={v === null || v === undefined ? "" : String(v)}
                      onChange={(e) => set(f.key, e.target.value)}
                    />
                  )}
                  {f.help ? <p className="text-xs text-muted-foreground">{f.help}</p> : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </>
  );
}
