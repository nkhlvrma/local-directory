"use client";

import { useMemo, useState, useTransition } from "react";
import {
  MessageCircle,
  Check,
  X,
  Clock,
  Plus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
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
  lead: "To message",
  contacted: "Waiting",
  yes: "Yes",
  no: "No",
  no_response: "No response",
};

const STATUS_CLASSES: Record<Lead["status"], string> = {
  lead: "",
  contacted:
    "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-200",
  yes: "bg-green-100 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-200",
  no: "bg-red-100 text-red-900 border-red-200 dark:bg-red-950 dark:text-red-200",
  no_response: "",
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
    <div className="space-y-6">
      {/* Add leads */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">Add candidate businesses</div>
          <Button variant="ghost" size="sm" onClick={() => setShowAdd((s) => !s)}>
            {showAdd ? "Hide" : "Show"}
          </Button>
        </div>
        {showAdd ? (
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              Paste tab-separated rows. Columns:{" "}
              <code>business_name · whatsapp · category_slug · neighborhood_slug · note</code>
            </div>
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground">Available slugs</summary>
              <div className="grid gap-4 mt-2 grid-cols-2">
                <div>
                  <div className="font-medium">Categories</div>
                  <ul className="mt-1 space-y-0.5">
                    {categories.map((c) => (
                      <li key={c.slug}><code>{c.slug}</code></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="font-medium">Neighborhoods</div>
                  <ul className="mt-1 space-y-0.5">
                    {neighborhoods.map((n) => (
                      <li key={n.slug}><code>{n.slug}</code></li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="font-mono text-sm"
              placeholder="Anita's Home Kitchen&#9;+919812345678&#9;tiffin-services&#9;gomti-nagar&#9;from Google Maps"
            />
            <div className="flex items-center gap-3">
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
                      toast(`Added ${res.inserted.length}`);
                    }
                    if (res.failed.length > 0) {
                      toast.error(`${res.failed.length} failed — check details below`);
                    }
                  });
                }}
              >
                <Plus className="size-4" />
                {pending ? "Adding…" : "Add to queue"}
              </Button>
              {addResult ? (
                <span className="text-xs text-muted-foreground">
                  {addResult.inserted.length} added · {addResult.failed.length} failed
                </span>
              ) : null}
            </div>
            {addResult && addResult.failed.length > 0 ? (
              <ul className="text-xs text-destructive space-y-1">
                {addResult.failed.map((f, i) => (
                  <li key={i}>Row {f.row}: {f.error}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </Card>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "lead", "contacted", "yes", "no", "no_response"] as const).map((f) => {
          const count = f === "all" ? leads.length : leads.filter((l) => l.status === f).length;
          const active = filter === f;
          return (
            <Button
              key={f}
              size="sm"
              variant={active ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="h-8"
            >
              {f === "all" ? "All" : STATUS_LABELS[f]} ({count})
            </Button>
          );
        })}
        <div className="ml-auto flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Message:</span>
          <Select value={lang} onValueChange={(v) => setLang(v as MessageLang)}>
            <SelectTrigger className="h-8 w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hinglish">Hinglish</SelectItem>
              <SelectItem value="hi">हिंदी</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preview */}
      <Card className="p-3 text-sm">
        <details>
          <summary className="cursor-pointer text-muted-foreground">
            Preview outreach message
          </summary>
          <pre className="whitespace-pre-wrap text-xs bg-muted p-3 rounded mt-2">
            {outreachMessage(lang, categories[0]?.name ?? "tiffin services")}
          </pre>
        </details>
      </Card>

      {/* Leads */}
      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {leads.length === 0
            ? "No leads yet. Paste candidates above to get started."
            : "No leads match this filter."}
        </p>
      ) : (
        <div className="space-y-2">
          {visible.map((l) => (
            <Card key={l.id} className="p-4">
              <div className="flex justify-between items-start gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{l.business_name}</span>
                    <Badge variant="secondary" className={STATUS_CLASSES[l.status]}>
                      {STATUS_LABELS[l.status]}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {[l.categories?.name, l.neighborhoods?.name, l.whatsapp_number]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                  {l.source_note ? (
                    <div className="text-xs text-muted-foreground mt-1">{l.source_note}</div>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
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
                  >
                    <Button size="sm">
                      <MessageCircle className="size-4" />
                      Message on WhatsApp
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pending || !l.categories || !l.neighborhoods || l.status === "yes"}
                    onClick={() =>
                      startTransition(async () => {
                        const next = await convertLeadToListing(l.id);
                        if (next) {
                          replaceLead(next);
                          toast(`Created listing for ${l.business_name}`);
                        }
                      })
                    }
                  >
                    <Check className="size-4" />
                    Yes → listing
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const next = await updateLeadStatus(l.id, "no");
                        if (next) replaceLead(next);
                      })
                    }
                  >
                    <X className="size-4" />
                    No
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const next = await updateLeadStatus(l.id, "no_response");
                        if (next) replaceLead(next);
                      })
                    }
                  >
                    <Clock className="size-4" />
                    No response
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
