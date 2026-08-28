"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
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
      <form onSubmit={submit}>
        <InputGroup className="h-14 rounded-xl bg-background shadow-sm has-[[data-slot=input-group-control]:focus-visible]:border-primary/50 has-[[data-slot=input-group-control]:focus-visible]:ring-2">
          <InputGroupInput
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            name="q"
            autoComplete="off"
            className="h-14 px-3 text-base"
          />
          <InputGroupAddon>
            <Search className="size-4 ml-2" aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="submit"
              disabled={!q.trim()}
              size="sm"
              className="mr-1 h-10 rounded-lg px-5"
            >
              Search
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
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
