import { Text, Flex } from "@radix-ui/themes";
import { DAYS, DAY_LABEL, formatDay } from "@/lib/hours";
import type { WeekHours } from "@/lib/types";

export function HoursTable({ hours }: { hours: WeekHours }) {
  return (
    <Flex direction="column" gap="1" style={{ maxWidth: 260 }}>
      {DAYS.map((d) => (
        <Flex justify="between" key={d}>
          <Text size="1" color="gray">{DAY_LABEL[d]}</Text>
          <Text size="1" style={{ fontVariantNumeric: "tabular-nums" }}>
            {formatDay(hours[d] ?? null)}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
}
