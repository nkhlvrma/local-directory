"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const inputCls =
    size === "lg" ? "h-12 text-base pl-10" : "h-10 pl-9";
  const iconCls = size === "lg" ? "size-4 left-3.5" : "size-4 left-3";

  return (
    <form onSubmit={submit} className="flex gap-2">
      <div className="relative flex-1">
        <Search
          className={`${iconCls} pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground`}
        />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          name="q"
          autoComplete="off"
          className={inputCls}
        />
      </div>
      <Button
        type="submit"
        size={size === "lg" ? "lg" : "default"}
        disabled={!q.trim()}
      >
        Search
      </Button>
    </form>
  );
}
