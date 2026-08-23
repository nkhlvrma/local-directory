"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Popover,
  Button,
  Flex,
  Text,
  TextField,
  Badge,
} from "@radix-ui/themes";
import { CaretDownIcon, HomeIcon } from "@radix-ui/react-icons";
import { setPin } from "@/app/actions/location";
import { isValidPin } from "@/lib/pin";
import { CITY_SLUG } from "@/lib/site";

const CITY_LABEL: Record<string, string> = {
  lucknow: "Lucknow",
  bangalore: "Bangalore",
};

// Small header widget that lets a visitor set their PIN so the directory
// filters to listings in that area. City is single-active per env; PIN is
// stored in a cookie so it persists across pages.
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
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger>
        <Button variant="soft" color="gray" size="1">
          <HomeIcon />
          <Text size="1" weight="medium">
            {cityName}
          </Text>
          {initialPin ? (
            <Badge color="grass" variant="solid" size="1">
              {initialPin}
            </Badge>
          ) : (
            <Text size="1" color="gray">
              set PIN
            </Text>
          )}
          <CaretDownIcon />
        </Button>
      </Popover.Trigger>
      <Popover.Content width="280px">
        <Flex direction="column" gap="3">
          <div>
            <Text as="label" size="1" color="gray" weight="medium">
              City
            </Text>
            <Text size="2" mt="1" as="div" weight="medium">
              {cityName}
            </Text>
            <Text size="1" color="gray" as="div">
              (more cities coming — first-cell strategy)
            </Text>
          </div>

          <div>
            <Text as="label" size="1" color="gray" weight="medium">
              PIN code
            </Text>
            <TextField.Root
              mt="1"
              value={pin}
              placeholder="6-digit PIN (e.g. 226010)"
              inputMode="numeric"
              maxLength={6}
              onChange={(e) =>
                setPinValue(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              color={invalid ? "red" : undefined}
            />
            <Text size="1" color="gray" mt="1" as="div">
              We&apos;ll show listings nearby first.
            </Text>
          </div>

          <Flex gap="2" justify="end">
            {initialPin ? (
              <Button
                variant="soft"
                color="gray"
                size="1"
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
              size="1"
              disabled={pending || (pin.length > 0 && !isValidPin(pin))}
              onClick={() => apply(pin)}
            >
              {pending ? "Applying…" : "Apply"}
            </Button>
          </Flex>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
}
