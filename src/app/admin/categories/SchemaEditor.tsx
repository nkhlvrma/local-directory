"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { FieldDef, FieldType } from "@/lib/types";
import { saveSchema } from "./actions";

// Structured (row-based) editor — no more JSON textarea.
// Each row is one field. Admin adds/removes/edits without touching JSON.
export function SchemaEditor({
  id,
  name,
  slug,
  schema,
}: {
  id: string;
  name: string;
  slug: string;
  schema: FieldDef[] | null;
}) {
  const [fields, setFields] = useState<FieldDef[]>(schema ?? []);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(fields) !== JSON.stringify(schema ?? []);

  function updateField(idx: number, patch: Partial<FieldDef>) {
    setFields((fs) => fs.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
  }
  function removeField(idx: number) {
    setFields((fs) => fs.filter((_, i) => i !== idx));
  }
  function addField() {
    setFields((fs) => [
      ...fs,
      { key: "", label: "", type: "text" },
    ]);
  }
  function submit() {
    startTransition(async () => {
      const res = await saveSchema(id, fields);
      if (res?.error) toast.error(res.error);
      else toast(`Saved ${name}`);
    });
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="font-medium">{name}</div>
        <Badge variant="secondary">{slug}</Badge>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No extra fields yet. Click <em>Add field</em> to define one.
        </p>
      ) : (
        <div className="space-y-3">
          {fields.map((f, idx) => (
            <div
              key={idx}
              className="grid gap-2 items-end sm:grid-cols-[1fr_1fr_140px_1fr_auto]"
            >
              <div className="space-y-1">
                <Label className="text-xs">Label (shown to users)</Label>
                <Input
                  value={f.label}
                  onChange={(e) => updateField(idx, { label: e.target.value })}
                  placeholder="₹ per meal"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Key (internal, no spaces)</Label>
                <Input
                  value={f.key}
                  onChange={(e) =>
                    updateField(idx, {
                      key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
                    })
                  }
                  placeholder="price_per_meal"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <Select
                  value={f.type}
                  onValueChange={(v) => updateField(idx, { type: v as FieldType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Yes/No</SelectItem>
                    <SelectItem value="select">Dropdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">
                  {f.type === "select"
                    ? "Options (comma-separated)"
                    : "Help text (optional)"}
                </Label>
                {f.type === "select" ? (
                  <Input
                    value={(f.options ?? []).join(", ")}
                    onChange={(e) =>
                      updateField(idx, {
                        options: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Veg, Non-veg, Jain"
                  />
                ) : (
                  <Input
                    value={f.help ?? ""}
                    onChange={(e) => updateField(idx, { help: e.target.value })}
                  />
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeField(idx)}
                title="Remove field"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={addField}>
          <Plus className="size-4" />
          Add field
        </Button>
        <Button
          size="sm"
          disabled={!dirty || pending}
          onClick={submit}
        >
          {pending ? "Saving…" : dirty ? "Save changes" : "Saved"}
        </Button>
      </div>
    </Card>
  );
}
