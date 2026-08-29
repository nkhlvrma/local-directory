"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { AlertTriangle, CheckCircle2, Mail } from "lucide-react";
import { requestPasswordReset } from "../actions";

const LINK_ERRORS: Record<string, string> = {
  link_invalid: "That reset link was missing information. Request a new one below.",
  link_expired:
    "That reset link has expired or was already used. Request a new one below.",
};

export function ForgotPasswordForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const sp = useSearchParams();
  const linkError = LINK_ERRORS[sp.get("error") ?? ""];

  if (sent) {
    return (
      <div className="space-y-4">
        <Alert>
          <CheckCircle2 className="size-4 text-green-600" />
          <AlertDescription>
            If that address belongs to an account, a reset link is on its way.
            The link works once and expires shortly.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="w-full">
          <Link href="/admin/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const res = await requestPasswordReset(fd);
          if (res?.error) setError(res.error);
          else setSent(true);
        });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="username" />
      </div>

      {linkError ? (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription>{linkError}</AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <Mail className="size-4" data-icon="inline-start" />
        )}
        {pending ? "Sending…" : "Send reset link"}
      </Button>
      <Button asChild variant="ghost" className="w-full">
        <Link href="/admin/login">Back to sign in</Link>
      </Button>
    </form>
  );
}
