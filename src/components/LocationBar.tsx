"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { CITY_SLUG } from "@/lib/site";

const CITY_LABEL: Record<string, string> = {
  lucknow: "Lucknow",
  bangalore: "Bangalore",
};

export function LocationBar({}: { initialPin?: string }) {
  const [open, setOpen] = useState(false);
  const cityName = CITY_LABEL[CITY_SLUG] ?? CITY_SLUG;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="link"
          size="sm"
          className="h-auto gap-1 border-0 px-1 text-sm font-medium underline underline-offset-4"
          aria-label={`Select city, currently ${cityName}`}
        >
          {cityName}
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">City</Label>
          <div className="mt-1 font-medium">{cityName}</div>
          <div className="text-xs text-muted-foreground">
            More cities are coming soon.
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
