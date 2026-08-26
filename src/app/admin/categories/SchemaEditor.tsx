"use client";

import { useState, useTransition } from "react";
import {
  Card,
  Flex,
  Text,
  Button,
  TextArea,
  Callout,
  Badge,
} from "@radix-ui/themes";
import { CheckCircledIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
import type { FieldDef } from "@/lib/types";
import { saveSchema } from "./actions";

export function SchemaEditor({
  id,
  name,
  slug,
  schema,
}: {
  id: string;
  name: string;
  slug: string;
  schema: FieldDef[] | null;
}) {
  const [text, setText] = useState(
    schema ? JSON.stringify(schema, null, 2) : "[]",
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function submit() {
    setError(null);
    setSaved(false);
    let parsed: FieldDef[];
    try {
      parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("Expected an array");
    } catch (e) {
      setError((e as Error).message);
      return;
    }
    startTransition(async () => {
      const res = await saveSchema(id, parsed);
      if (res?.error) setError(res.error);
      else setSaved(true);
    });
  }

  return (
    <Card size="2">
      <Flex direction="column" gap="2">
        <Flex align="center" gap="2">
          <Text weight="medium">{name}</Text>
          <Badge color="gray" variant="soft">{slug}</Badge>
        </Flex>
        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          style={{ fontFamily: "var(--code-font-family)" }}
        />
        <Flex align="center" gap="2">
          <Button size="1" onClick={submit} disabled={pending}>
            {pending ? "Saving…" : "Save schema"}
          </Button>
          {saved ? (
            <Text size="1" color="grass">
              <CheckCircledIcon /> Saved
            </Text>
          ) : null}
        </Flex>
        {error ? (
          <Callout.Root color="red" size="1">
            <Callout.Icon><ExclamationTriangleIcon /></Callout.Icon>
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        ) : null}
      </Flex>
    </Card>
  );
}
