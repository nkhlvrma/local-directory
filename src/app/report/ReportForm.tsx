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
import { submitReport } from "./actions";

export function ReportForm({ listingId }: { listingId: string }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");

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
            <SelectItem value="closed">Closed / no longer operating</SelectItem>
            <SelectItem value="wrong_info">Wrong info</SelectItem>
            <SelectItem value="spam">Spam</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea id="note" name="note" rows={3} maxLength={400} />
      </div>
      {error ? (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" disabled={pending || !listingId || !reason}>
        {pending ? "Sending…" : "Send report"}
      </Button>
    </form>
  );
}
