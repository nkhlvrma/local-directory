"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Plus } from "lucide-react";
import { createCategory } from "../actions";

export function CategoryForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-wrap items-end gap-3 border rounded-lg p-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const res = await createCategory(fd);
          if (res?.error) setError(res.error);
          else (e.target as HTMLFormElement).reset();
        });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="cat-name">Name</Label>
        <Input id="cat-name" name="name" required maxLength={60} placeholder="Pest Control" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cat-slug">Slug (optional)</Label>
        <Input id="cat-slug" name="slug" maxLength={60} placeholder="auto from name" />
      </div>
      <Button type="submit" disabled={pending}>
        <Plus className="size-4" />
        {pending ? "Adding…" : "Add category"}
      </Button>
      {error ? (
        <Alert variant="destructive" className="w-full">
          <AlertTriangle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <p className="w-full text-xs text-muted-foreground">
        Icon is picked automatically from the name — no need to set one.
      </p>
    </form>
  );
}
