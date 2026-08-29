"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { AlertTriangle, CheckCircle2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { updatePassword } from "../actions";

export function ResetPasswordForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const router = useRouter();

  if (done) {
    return (
      <div className="space-y-4">
        <Alert>
          <CheckCircle2 className="size-4 text-green-600" />
          <AlertDescription>
            Password updated. You&apos;re signed in on this device.
          </AlertDescription>
        </Alert>
        <Button asChild className="w-full">
          <Link href="/admin">Go to dashboard</Link>
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
          const res = await updatePassword(fd);
          if (res?.error) {
            setError(res.error);
            return;
          }
          toast.success("Password updated");
          setDone(true);
          // The recovery exchange leaves a real session behind, so refresh
          // to let the admin layout pick it up.
          router.refresh();
        });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground">At least 8 characters.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm_password">Confirm new password</Label>
        <Input
          id="confirm_password"
          name="confirm_password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

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
          <KeyRound className="size-4" data-icon="inline-start" />
        )}
        {pending ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}
