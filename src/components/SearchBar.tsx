"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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
      <form onSubmit={submit}>
        <div className="flex items-center gap-0 rounded-xl border border-border bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:border-primary/50 transition-all">
          <Search className="size-4 ml-4 shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            name="q"
            autoComplete="off"
            className="flex-1 h-14 px-3 text-base bg-transparent outline-none placeholder:text-muted-foreground"
          />
          <Button
            type="submit"
            disabled={!q.trim()}
            className="m-1.5 rounded-lg h-11 px-5 shrink-0"
          >
            Search
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="size-4 left-3 pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          name="q"
          autoComplete="off"
          className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 placeholder:text-muted-foreground transition-all"
        />
      </div>
      <Button type="submit" disabled={!q.trim()}>
        Search
      </Button>
    </form>
  );
}
