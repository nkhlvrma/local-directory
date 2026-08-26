"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TextField, Button, Flex } from "@radix-ui/themes";
import { Search } from "lucide-react";

// Prominent hero search. Submits to /search?q=… which does the query
// server-side against the active city. Keyboard: Enter submits.
export function SearchBar({
  size = "3",
  initialQuery = "",
  autoFocus = false,
  placeholder = "Search tiffin, tailors, electricians…",
}: {
  size?: "2" | "3";
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

  return (
    <form onSubmit={submit} data-hero-search>
      <Flex gap="2">
        <TextField.Root
          size={size}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          style={{ flex: 1 }}
          name="q"
          autoComplete="off"
        >
          <TextField.Slot>
            <Search size={16} strokeWidth={2} />
          </TextField.Slot>
        </TextField.Root>
        <Button type="submit" size={size} disabled={!q.trim()}>
          Search
        </Button>
      </Flex>
    </form>
  );
}
