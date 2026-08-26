"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Flex, Button } from "@radix-ui/themes";
import { CheckCircledIcon, ImageIcon, ClockIcon } from "@radix-ui/react-icons";

// URL-driven filter chips. Server pages read the params directly.
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

  const chip = (key: string, label: string, Icon: React.ComponentType<{ width?: number; height?: number }>) => {
    const active = params.get(key) === "1";
    return (
      <Button
        size="1"
        variant={active ? "solid" : "soft"}
        color={active ? "grass" : "gray"}
        onClick={() => toggle(key)}
      >
        <Icon width={12} height={12} />
        {label}
      </Button>
    );
  };

  return (
    <Flex gap="2" wrap="wrap">
      {chip("verified", "Verified only", CheckCircledIcon)}
      {chip("photo", "Has photo", ImageIcon)}
      {chip("open", "Open now", ClockIcon)}
    </Flex>
  );
}
