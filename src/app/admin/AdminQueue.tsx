"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Card, Flex, Text, Button, Badge, Checkbox } from "@radix-ui/themes";
import { CheckIcon, Cross1Icon, Pencil1Icon } from "@radix-ui/react-icons";
import { decideListing, bulkDecide } from "./actions";

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
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const visible = items.filter((i) => !hidden.has(i.id));

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === visible.length) setSelected(new Set());
    else setSelected(new Set(visible.map((i) => i.id)));
  }

  function bulkAction(action: "approve" | "reject") {
    if (selected.size === 0) return;
    const ids = [...selected];
    startTransition(async () => {
      await bulkDecide(ids, action);
      setHidden((h) => {
        const next = new Set(h);
        ids.forEach((id) => next.add(id));
        return next;
      });
      setSelected(new Set());
    });
  }

  if (visible.length === 0) {
    return (
      <Text size="2" color="gray">
        {items.length === 0 ? "Queue is empty." : "All caught up."}
      </Text>
    );
  }

  return (
    <Flex direction="column" gap="3">
      <Flex align="center" gap="3" wrap="wrap">
        <Checkbox
          checked={selected.size === visible.length && visible.length > 0}
          onCheckedChange={toggleAll}
        />
        <Text size="1" color="gray">
          {selected.size} of {visible.length} selected
        </Text>
        {selected.size > 0 ? (
          <Flex gap="2" ml="auto">
            <Button
              color="grass"
              size="1"
              disabled={pending}
              onClick={() => bulkAction("approve")}
            >
              <CheckIcon />
              Approve selected
            </Button>
            <Button
              variant="soft"
              color="gray"
              size="1"
              disabled={pending}
              onClick={() => bulkAction("reject")}
            >
              <Cross1Icon />
              Reject selected
            </Button>
          </Flex>
        ) : null}
      </Flex>

      {visible.map((i) => (
        <Card key={i.id} size="2">
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2" wrap="wrap">
              <Checkbox checked={selected.has(i.id)} onCheckedChange={() => toggle(i.id)} />
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
              <Link
                href={`/admin/listings/${i.id}/edit`}
                style={{ textDecoration: "none" }}
              >
                <Button variant="soft" size="1">
                  <Pencil1Icon />
                  Edit
                </Button>
              </Link>
            </Flex>
          </Flex>
        </Card>
      ))}
    </Flex>
  );
}
