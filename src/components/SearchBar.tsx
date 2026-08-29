"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function SearchBar({
  size = "lg",
  initialQuery = "",
  autoFocus = false,
  placeholder = "Search tiffin, tailors, electricians…",
}: {
  size?: "md" | "lg";
  initialQuery?: string;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const router = useRouter();

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  if (size === "lg") {
    return (
      <form onSubmit={submit} className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            name="q"
            autoComplete="off"
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={!q.trim()}>
          Search
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={submit}>
      <InputGroup>
        <InputGroupInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          name="q"
          autoComplete="off"
          className="h-10 pl-3"
        />
        <InputGroupAddon>
          <Search className="size-4 ml-1" aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <InputGroupButton type="submit" disabled={!q.trim()}>
            Search
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
