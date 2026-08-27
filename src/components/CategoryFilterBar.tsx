"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Image as ImageIcon, Clock } from "lucide-react";

export function CategoryFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function toggle(key: string) {
    const next = new URLSearchParams(params.toString());
    if (next.get(key) === "1") next.delete(key);
    else next.set(key, "1");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const chip = (
    key: string,
    label: string,
    Icon: React.ComponentType<{ className?: string }>,
  ) => {
    const active = params.get(key) === "1";
    return (
      <Button
        size="sm"
        variant={active ? "default" : "outline"}
        onClick={() => toggle(key)}
        className="h-8"
      >
        <Icon className="size-3.5" />
        {label}
      </Button>
    );
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {chip("verified", "Verified only", CheckCircle2)}
      {chip("photo", "Has photo", ImageIcon)}
      {chip("open", "Open now", Clock)}
    </div>
  );
}
