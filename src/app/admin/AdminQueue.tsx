"use client";

import { useState, useTransition } from "react";
import { Card, Flex, Text, Button, Badge } from "@radix-ui/themes";
import { CheckIcon, Cross1Icon } from "@radix-ui/react-icons";
import { decideListing } from "./actions";

type Item = {
  id: string;
  name: string;
  description: string | null;
  whatsapp_number: string;
  created_at: string;
  category: string;
  neighborhood: string;
};

export function AdminQueue({ items }: { items: Item[] }) {
  const [pending, startTransition] = useTransition();
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const visible = items.filter((i) => !hidden.has(i.id));

  if (visible.length === 0) {
    return (
      <Text size="2" color="gray">
        {items.length === 0 ? "Queue is empty." : "All caught up."}
      </Text>
    );
  }

  return (
    <Flex direction="column" gap="2">
      {visible.map((i) => (
        <Card key={i.id} size="2">
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2" wrap="wrap">
              <Text weight="medium">{i.name}</Text>
              <Badge color="gray" variant="soft">{i.category}</Badge>
              <Badge color="gray" variant="soft">{i.neighborhood}</Badge>
              <Text size="1" color="gray">{i.whatsapp_number}</Text>
            </Flex>
            {i.description ? (
              <Text size="2">{i.description}</Text>
            ) : null}
            <Flex gap="2">
              <Button
                color="grass"
                size="1"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await decideListing(i.id, "approve");
                    setHidden((s) => new Set(s).add(i.id));
                  })
                }
              >
                <CheckIcon />
                Approve
              </Button>
              <Button
                variant="soft"
                color="gray"
                size="1"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await decideListing(i.id, "reject");
                    setHidden((s) => new Set(s).add(i.id));
                  })
                }
              >
                <Cross1Icon />
                Reject
              </Button>
            </Flex>
          </Flex>
        </Card>
      ))}
    </Flex>
  );
}
