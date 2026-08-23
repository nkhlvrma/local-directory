"use client";

import { useState, useTransition } from "react";
import {
  Select,
  TextArea,
  Button,
  Flex,
  Text,
  Callout,
} from "@radix-ui/themes";
import { CheckCircledIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { submitReport } from "./actions";

export function ReportForm({ listingId }: { listingId: string }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  if (done)
    return (
      <Callout.Root color="grass">
        <Callout.Icon><CheckCircledIcon /></Callout.Icon>
        <Callout.Text>Thanks — we&apos;ll take a look.</Callout.Text>
      </Callout.Root>
    );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget);
        fd.set("listing_id", listingId);
        fd.set("reason", reason);
        startTransition(async () => {
          const res = await submitReport(fd);
          if (res?.error) setError(res.error);
          else setDone(true);
        });
      }}
    >
      <Flex direction="column" gap="3">
        <label>
          <Text as="div" size="1" color="gray" weight="medium" mb="1">Reason</Text>
          <Select.Root value={reason} onValueChange={setReason} required>
            <Select.Trigger placeholder="Choose reason" />
            <Select.Content>
              <Select.Item value="closed">Closed / no longer operating</Select.Item>
              <Select.Item value="wrong_info">Wrong info</Select.Item>
              <Select.Item value="spam">Spam</Select.Item>
              <Select.Item value="other">Other</Select.Item>
            </Select.Content>
          </Select.Root>
        </label>
        <label>
          <Text as="div" size="1" color="gray" weight="medium" mb="1">Note (optional)</Text>
          <TextArea name="note" rows={3} maxLength={400} />
        </label>
        {error ? (
          <Callout.Root color="red">
            <Callout.Icon><ExclamationTriangleIcon /></Callout.Icon>
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        ) : null}
        <div>
          <Button type="submit" disabled={pending || !listingId || !reason}>
            {pending ? "Sending…" : "Send report"}
          </Button>
        </div>
      </Flex>
    </form>
  );
}
