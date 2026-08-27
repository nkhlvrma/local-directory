"use client";

import { useState, useTransition } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { importListings, type ImportResult } from "./actions";

export function ImportForm() {
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  return (
    <div className="space-y-3">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        placeholder={
          "Anita's Home Kitchen\ttiffin-services\tgomti-nagar\t+919812345678\t226010\tHome-cooked North Indian tiffin.\ttrue"
        }
        className="font-mono text-sm"
      />
      <div className="flex items-center gap-3">
        <Button
          disabled={pending || !text.trim()}
          onClick={() => {
            setResult(null);
            startTransition(async () => {
              const res = await importListings(text);
              setResult(res);
            });
          }}
        >
          <Upload className="size-4" />
          {pending ? "Importing…" : "Import"}
        </Button>
        <span className="text-xs text-muted-foreground">
          Rows land as pending — review at /admin/pending.
        </span>
      </div>

      {result ? (
        <Card className="p-4">
          <p className="text-sm">
            <strong>{result.inserted}</strong> inserted ·{" "}
            <strong>{result.failed.length}</strong> failed
          </p>
          {result.failed.length > 0 ? (
            <ul className="text-xs text-destructive space-y-1 mt-2">
              {result.failed.map((f, i) => (
                <li key={i}>Row {f.row}: {f.error}</li>
              ))}
            </ul>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
