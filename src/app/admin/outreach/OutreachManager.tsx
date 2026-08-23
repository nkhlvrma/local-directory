"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Card,
  Flex,
  Text,
  Button,
  Badge,
  TextArea,
  Select,
  Code,
} from "@radix-ui/themes";
import {
  ChatBubbleIcon,
  CheckIcon,
  Cross1Icon,
  ClockIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import type { Lead } from "./page";
import {
  addLeads,
  updateLeadStatus,
  convertLeadToListing,
  type AddResult,
} from "./actions";
import { outreachMessage, outreachWaLink, type MessageLang } from "@/lib/outreach";

type Option = { id: string; slug: string; name: string };
type StatusFilter = "all" | Lead["status"];

const STATUS_LABELS: Record<Lead["status"], string> = {
  lead: "Lead",
  contacted: "Contacted",
  yes: "Yes",
  no: "No",
  no_response: "No response",
};

const STATUS_COLORS: Record<Lead["status"], "gray" | "amber" | "grass" | "red"> = {
  lead: "gray",
  contacted: "amber",
  yes: "grass",
  no: "red",
  no_response: "gray",
};

export function OutreachManager({
  categories,
  neighborhoods,
  initialLeads,
}: {
  categories: Option[];
  neighborhoods: Option[];
  initialLeads: Lead[];
}) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [lang, setLang] = useState<MessageLang>("hinglish");
  const [showAdd, setShowAdd] = useState(initialLeads.length === 0);
  const [text, setText] = useState("");
  const [addResult, setAddResult] = useState<AddResult | null>(null);
  const [pending, startTransition] = useTransition();

  const visible = useMemo(
    () => (filter === "all" ? leads : leads.filter((l) => l.status === filter)),
    [leads, filter],
  );

  function replaceLead(next: Lead) {
    setLeads((all) => all.map((l) => (l.id === next.id ? next : l)));
  }

  return (
    <Flex direction="column" gap="4">
      {/* --- Add leads --- */}
      <Card size="2">
        <Flex justify="between" align="center" mb="2">
          <Text weight="medium" size="2">Add candidate businesses</Text>
          <Button
            variant="ghost"
            size="1"
            onClick={() => setShowAdd((s) => !s)}
          >
            {showAdd ? "hide" : "show"}
          </Button>
        </Flex>
        {showAdd ? (
          <Flex direction="column" gap="2">
            <Text size="1" color="gray">
              Paste tab-separated rows. Columns:{" "}
              <Code>business_name</Code> · <Code>whatsapp</Code> ·{" "}
              <Code>category_slug</Code> · <Code>neighborhood_slug</Code> ·{" "}
              <Code>note</Code>
            </Text>
            <details>
              <summary style={{ fontSize: 12, cursor: "pointer", color: "var(--gray-11)" }}>
                Available slugs
              </summary>
              <Flex gap="4" mt="2">
                <div>
                  <Text size="1" weight="medium">Categories</Text>
                  <Flex direction="column" gap="1" mt="1">
                    {categories.map((c) => (
                      <Text size="1" key={c.slug}><Code>{c.slug}</Code></Text>
                    ))}
                  </Flex>
                </div>
                <div>
                  <Text size="1" weight="medium">Neighborhoods</Text>
                  <Flex direction="column" gap="1" mt="1">
                    {neighborhoods.map((n) => (
                      <Text size="1" key={n.slug}><Code>{n.slug}</Code></Text>
                    ))}
                  </Flex>
                </div>
              </Flex>
            </details>
            <TextArea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="Anita's Home Kitchen&#9;+919812345678&#9;tiffin-services&#9;gomti-nagar&#9;from Google Maps"
              style={{ fontFamily: "var(--code-font-family)" }}
            />
            <Flex align="center" gap="3">
              <Button
                disabled={pending || !text.trim()}
                onClick={() => {
                  setAddResult(null);
                  startTransition(async () => {
                    const res = await addLeads(text);
                    setAddResult(res);
                    if (res.inserted.length > 0) {
                      setLeads((all) => [...res.inserted, ...all]);
                      setText("");
                    }
                  });
                }}
              >
                <PlusIcon />
                {pending ? "Adding…" : "Add to queue"}
              </Button>
              {addResult ? (
                <Text size="1" color="gray">
                  {addResult.inserted.length} added ·{" "}
                  {addResult.failed.length} failed
                </Text>
              ) : null}
            </Flex>
            {addResult && addResult.failed.length > 0 ? (
              <Flex direction="column" gap="1">
                {addResult.failed.map((f, i) => (
                  <Text size="1" color="red" key={i}>
                    Row {f.row}: {f.error}
                  </Text>
                ))}
              </Flex>
            ) : null}
          </Flex>
        ) : null}
      </Card>

      {/* --- Controls --- */}
      <Flex align="center" gap="2" wrap="wrap">
        {(["all", "lead", "contacted", "yes", "no", "no_response"] as const).map((f) => {
          const count =
            f === "all" ? leads.length : leads.filter((l) => l.status === f).length;
          const active = filter === f;
          return (
            <Button
              key={f}
              variant={active ? "solid" : "soft"}
              color={active ? undefined : "gray"}
              size="1"
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : STATUS_LABELS[f]} ({count})
            </Button>
          );
        })}
        <Flex align="center" gap="2" ml="auto">
          <Text size="1" color="gray">Message language:</Text>
          <Select.Root value={lang} onValueChange={(v) => setLang(v as MessageLang)}>
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="hinglish">Hinglish</Select.Item>
              <Select.Item value="hi">हिंदी</Select.Item>
              <Select.Item value="en">English</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>
      </Flex>

      {/* --- Message preview --- */}
      <Card size="2">
        <details>
          <summary style={{ fontSize: 13, cursor: "pointer", color: "var(--gray-11)" }}>
            Preview outreach message
          </summary>
          <Text
            as="div"
            mt="2"
            size="1"
            style={{
              whiteSpace: "pre-wrap",
              background: "var(--gray-a2)",
              padding: "var(--space-3)",
              borderRadius: "var(--radius-3)",
            }}
          >
            {outreachMessage(lang, categories[0]?.name ?? "tiffin services")}
          </Text>
        </details>
      </Card>

      {/* --- Leads list --- */}
      {visible.length === 0 ? (
        <Text size="2" color="gray">
          {leads.length === 0
            ? "No leads yet. Paste candidates above to get started."
            : "No leads match this filter."}
        </Text>
      ) : (
        <Flex direction="column" gap="2">
          {visible.map((l) => (
            <Card key={l.id} size="2">
              <Flex justify="between" align="start" gap="3" wrap="wrap">
                <div style={{ minWidth: 0 }}>
                  <Flex align="center" gap="2" wrap="wrap">
                    <Text weight="medium">{l.business_name}</Text>
                    <Badge color={STATUS_COLORS[l.status]} variant="soft">
                      {STATUS_LABELS[l.status]}
                    </Badge>
                  </Flex>
                  <Text size="1" color="gray" as="div" mt="1">
                    {[l.categories?.name, l.neighborhoods?.name, l.whatsapp_number]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                  {l.source_note ? (
                    <Text size="1" color="gray" as="div" mt="1">
                      {l.source_note}
                    </Text>
                  ) : null}
                </div>
                <Flex gap="2" wrap="wrap">
                  <a
                    href={outreachWaLink(
                      l.whatsapp_number,
                      lang,
                      l.categories?.name ?? "local services",
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      startTransition(async () => {
                        const next = await updateLeadStatus(l.id, "contacted");
                        if (next) replaceLead(next);
                      })
                    }
                    style={{ textDecoration: "none" }}
                  >
                    <Button color="grass" size="1">
                      <ChatBubbleIcon />
                      Message on WhatsApp
                    </Button>
                  </a>
                  <Button
                    color="grass"
                    variant="soft"
                    size="1"
                    disabled={pending || !l.categories || !l.neighborhoods || l.status === "yes"}
                    onClick={() =>
                      startTransition(async () => {
                        const next = await convertLeadToListing(l.id);
                        if (next) replaceLead(next);
                      })
                    }
                  >
                    <CheckIcon />
                    Yes → listing
                  </Button>
                  <Button
                    variant="soft"
                    color="gray"
                    size="1"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const next = await updateLeadStatus(l.id, "no");
                        if (next) replaceLead(next);
                      })
                    }
                  >
                    <Cross1Icon />
                    No
                  </Button>
                  <Button
                    variant="soft"
                    color="gray"
                    size="1"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const next = await updateLeadStatus(l.id, "no_response");
                        if (next) replaceLead(next);
                      })
                    }
                  >
                    <ClockIcon />
                    No response
                  </Button>
                </Flex>
              </Flex>
            </Card>
          ))}
        </Flex>
      )}
    </Flex>
  );
}
