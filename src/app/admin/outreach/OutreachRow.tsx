"use client";

import Link from "next/link";
import { useTransition } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { whatsappLink } from "@/lib/whatsapp";
import { convertLeadToListing, setOutreachStatus, updateOutreachLead } from "../actions";
import { OptionSelect, type Option } from "./OptionSelect";

export type Lead = {
  id: string;
  business_name: string;
  whatsapp_number: string;
  status: string;
  source_note: string | null;
  contacted_at: string | null;
  listing_id: string | null;
  category_id: string | null;
  neighborhood_id: string | null;
  categories: { name: string } | null;
  neighborhoods: { name: string } | null;
};

export const STATUS_LABEL: Record<string, string> = {
  lead: "To contact",
  contacted: "Contacted",
  yes: "Said yes",
  no: "Said no",
  no_response: "No response",
};

// Short version of the in-person pitch in docs/branding (outreach scripts):
// free, no app, customers message them directly. Asks for a "haan" so the
// reply doubles as consent.
function openerFor(lead: Lead, siteName: string, cityName: string): string {
  const what = lead.categories?.name.toLowerCase() ?? "local services";
  return (
    `Namaste ${lead.business_name}! Main ${siteName} bana raha hoon — ${cityName} ke local ` +
    `businesses ki free directory. Log ${what} search karte hain aur seedha aapke WhatsApp ` +
    `pe message karte hain. Koi fees nahi, koi app nahi. Kya hum aapko list kar sakte hain? ` +
    `Bas "haan" reply kar dijiye.`
  );
}

export function OutreachRow({
  lead,
  categories,
  neighborhoods,
  siteName,
  cityName,
}: {
  lead: Lead;
  categories: Option[];
  neighborhoods: Option[];
  siteName: string;
  cityName: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const setStatus = (status: string) =>
    startTransition(async () => {
      const res = await setOutreachStatus(lead.id, status);
      if (res.error) toast.error(res.error);
    });

  const setPlace = (field: "category_id" | "neighborhood_id", id: string) =>
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", lead.id);
      fd.set("category_id", field === "category_id" ? id : (lead.category_id ?? ""));
      fd.set("neighborhood_id", field === "neighborhood_id" ? id : (lead.neighborhood_id ?? ""));
      const res = await updateOutreachLead(fd);
      if (res.error) toast.error(res.error);
    });

  const next: { status: string; label: string }[] =
    lead.status === "lead"
      ? [{ status: "contacted", label: "Mark contacted" }]
      : lead.status === "contacted"
        ? [
            { status: "yes", label: "Said yes" },
            { status: "no", label: "Said no" },
            { status: "no_response", label: "No response" },
          ]
        : [{ status: "lead", label: "Reset" }];

  return (
    <div className="border rounded-lg p-3 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium flex flex-wrap items-center gap-1.5">
            {lead.business_name}
            <Badge variant="outline">{STATUS_LABEL[lead.status] ?? lead.status}</Badge>
            {pending ? <Spinner /> : null}
          </p>
          <p className="text-sm text-muted-foreground">
            {lead.whatsapp_number}
            {lead.source_note ? ` · ${lead.source_note}` : ""}
            {lead.contacted_at
              ? ` · contacted ${new Date(lead.contacted_at).toLocaleDateString("en-IN")}`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <a
              href={whatsappLink(lead.whatsapp_number, openerFor(lead, siteName, cityName))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </a>
          </Button>
          {next.map((n) => (
            <Button
              key={n.status}
              size="sm"
              variant={n.status === "yes" ? "default" : "outline"}
              disabled={pending}
              onClick={() => setStatus(n.status)}
            >
              {n.label}
            </Button>
          ))}
          {lead.status === "yes" ? (
            lead.listing_id ? (
              <Button asChild size="sm">
                <Link href={`/admin/listings/${lead.listing_id}/edit`}>
                  Open listing <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const res = await convertLeadToListing(lead.id);
                    if (res.error) toast.error(res.error);
                    else if (res.listingId) {
                      toast.success("Listing created — add details and approve it");
                      router.push(`/admin/listings/${res.listingId}/edit`);
                    }
                  })
                }
              >
                Create listing <ArrowRight className="size-4" />
              </Button>
            )
          ) : null}
        </div>
      </div>
      {!lead.listing_id && (!lead.category_id || !lead.neighborhood_id) ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <OptionSelect
            options={categories}
            value={lead.category_id ?? ""}
            onChange={(id) => setPlace("category_id", id)}
            className="h-8"
          />
          <OptionSelect
            options={neighborhoods}
            value={lead.neighborhood_id ?? ""}
            onChange={(id) => setPlace("neighborhood_id", id)}
            className="h-8"
          />
        </div>
      ) : null}
    </div>
  );
}
