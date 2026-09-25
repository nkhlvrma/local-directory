"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Turnstile } from "@/components/Turnstile";
import { submitReport } from "./actions";
import { REPORT_REASONS, type ReportReason } from "@/lib/report-reasons";

export function ReportForm({
  listingId,
  initialReason,
}: {
  listingId: string;
  initialReason?: ReportReason;
}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState<string>(initialReason ?? "");
  const isOwner = reason === "owner_update";

  if (done)
    return (
      <Alert>
        <CheckCircle2 className="size-4 text-green-600" />
        <AlertDescription>Thanks — we&apos;ll take a look.</AlertDescription>
      </Alert>
    );

  return (
    <form
      className="space-y-3"
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
      <div className="space-y-1.5">
        <Label>Reason</Label>
        <Select value={reason} onValueChange={setReason} required>
          <SelectTrigger>
            <SelectValue placeholder="Choose reason" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(REPORT_REASONS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="note">{isOwner ? "What should change?" : "Note (optional)"}</Label>
        <Textarea
          id="note"
          name="note"
          rows={isOwner ? 5 : 3}
          maxLength={400}
          required={isOwner}
          placeholder={
            isOwner
              ? "New hours, number, description… and a phone or email we can confirm with."
              : undefined
          }
        />
      </div>
      {/* Injects cf-turnstile-response into the form; picked up by the
          FormData below, same as the listing-submission form. */}
      <Turnstile />
      {error ? (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" disabled={pending || !listingId || !reason}>
        {pending ? "Sending…" : isOwner ? "Send request" : "Send report"}
      </Button>
    </form>
  );
}
