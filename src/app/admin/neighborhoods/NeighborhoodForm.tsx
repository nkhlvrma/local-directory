"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Plus } from "lucide-react";
import { createNeighborhood } from "../actions";

export function NeighborhoodForm() {
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
          const res = await createNeighborhood(fd);
          if (res?.error) setError(res.error);
          else (e.target as HTMLFormElement).reset();
        });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="nb-name">Name</Label>
        <Input id="nb-name" name="name" required maxLength={60} placeholder="Chowk" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="nb-slug">Slug (optional)</Label>
        <Input id="nb-slug" name="slug" maxLength={60} placeholder="auto from name" />
      </div>
      <Button type="submit" disabled={pending}>
        <Plus className="size-4" />
        {pending ? "Adding…" : "Add neighborhood"}
      </Button>
      {error ? (
        <Alert variant="destructive" className="w-full">
          <AlertTriangle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
}
