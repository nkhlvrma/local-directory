"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronDown, MapPin } from "lucide-react";
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
          variant="ghost"
          size="sm"
          className="h-auto gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/15 hover:text-white"
          aria-label={`Select city, currently ${cityName}`}
        >
          <MapPin className="size-3.5" />
          {cityName}
          <ChevronDown className="size-3.5 text-white/70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-3 bg-popover/80 backdrop-blur-md">
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
