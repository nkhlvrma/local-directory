"use client";

import { useState, useTransition } from "react";
import { TextArea, Button, Flex, Text, Card } from "@radix-ui/themes";
import { UploadIcon } from "@radix-ui/react-icons";
import { importListings, type ImportResult } from "./actions";

export function ImportForm() {
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  return (
    <Flex direction="column" gap="3">
      <TextArea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        placeholder={
          "Anita's Home Kitchen\ttiffin-services\tgomti-nagar\t+919812345678\t226010\tHome-cooked North Indian tiffin.\ttrue"
        }
        style={{ fontFamily: "var(--code-font-family)" }}
      />
      <Flex align="center" gap="3">
        <Button
          disabled={pending || !text.trim()}
          onClick={() => {
            setResult(null);
            startTransition(async () => {
              const res = await importListings(text);
              setResult(res);
            });
          }}
        >
          <UploadIcon />
          {pending ? "Importing…" : "Import"}
        </Button>
        <Text size="1" color="gray">
          Rows land as pending — review at /admin.
        </Text>
      </Flex>

      {result ? (
        <Card size="2">
          <Text size="2">
            <strong>{result.inserted}</strong> inserted ·{" "}
            <strong>{result.failed.length}</strong> failed
          </Text>
          {result.failed.length > 0 ? (
            <Flex direction="column" gap="1" mt="2">
              {result.failed.map((f, i) => (
                <Text size="1" color="red" key={i}>
                  Row {f.row}: {f.error}
                </Text>
              ))}
            </Flex>
          ) : null}
        </Card>
      ) : null}
    </Flex>
  );
}
