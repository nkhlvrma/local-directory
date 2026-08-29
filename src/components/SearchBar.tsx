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
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/70"
            aria-hidden="true"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            name="q"
            autoComplete="off"
            // Same translucent treatment as the LocationBar pill above it,
            // so the two controls read as one set against the hero photo.
            className="pl-9 border-white/20 bg-white/10 text-white backdrop-blur-sm placeholder:text-white/70 focus-visible:border-white/40 dark:bg-white/10"
          />
        </div>
        {/* Stays fully opaque while disabled: the button sits on hero
            artwork where the default dimming just reads as "washed out"
            rather than "not yet usable". Dark label because white on amber
            falls well below a readable contrast ratio. */}
        <Button
          type="submit"
          disabled={!q.trim()}
          className="bg-amber-500 text-amber-950 hover:bg-amber-400 disabled:opacity-100"
        >
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
