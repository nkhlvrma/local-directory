"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, ChevronDown } from "lucide-react";
import { setPin } from "@/app/actions/location";
import { isValidPin } from "@/lib/pin";
import { CITY_SLUG } from "@/lib/site";

const CITY_LABEL: Record<string, string> = {
  lucknow: "Lucknow",
  bangalore: "Bangalore",
};

export function LocationBar({ initialPin }: { initialPin: string }) {
  const [open, setOpen] = useState(false);
  const [pin, setPinValue] = useState(initialPin);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const cityName = CITY_LABEL[CITY_SLUG] ?? CITY_SLUG;
  const invalid = pin.length > 0 && !isValidPin(pin);

  function apply(next: string) {
    startTransition(async () => {
      await setPin(next);
      router.refresh();
      setOpen(false);
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <MapPin className="size-4" />
          <span className="font-medium">{cityName}</span>
          {initialPin ? (
            <Badge className="bg-green-100 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-200">
              {initialPin}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-xs">set PIN</span>
          )}
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">City</Label>
          <div className="mt-1 font-medium">{cityName}</div>
          <div className="text-xs text-muted-foreground">
            More cities coming — first-cell strategy.
          </div>
        </div>
        <div>
          <Label htmlFor="pin-input" className="text-xs text-muted-foreground">
            PIN code
          </Label>
          <Input
            id="pin-input"
            className="mt-1"
            value={pin}
            placeholder="6-digit PIN (e.g. 226010)"
            inputMode="numeric"
            maxLength={6}
            onChange={(e) =>
              setPinValue(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            aria-invalid={invalid || undefined}
          />
          <div className="mt-1 text-xs text-muted-foreground">
            We&apos;ll show listings nearby first.
          </div>
        </div>
        <div className="flex justify-end gap-2">
          {initialPin ? (
            <Button
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => {
                setPinValue("");
                apply("");
              }}
            >
              Clear
            </Button>
          ) : null}
          <Button
            size="sm"
            disabled={pending || invalid}
            onClick={() => apply(pin)}
          >
            {pending ? "Applying…" : "Apply"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
