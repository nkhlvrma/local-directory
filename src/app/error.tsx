"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

// Route-level boundary: a failed Supabase query used to fall through to Next's
// stock error screen. Keeps the site chrome and offers a way forward.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-20">
      <div className="mx-auto max-w-md text-center space-y-5">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" />
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight font-heading">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load this page. It&apos;s usually temporary — try
            again in a moment.
          </p>
          {error.digest ? (
            <p className="text-xs text-muted-foreground font-mono">
              Reference: {error.digest}
            </p>
          ) : null}
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button onClick={reset}>
            <RotateCw className="size-3.5" />
            Try again
          </Button>
          <Link href="/">
            <Button variant="outline">Go home</Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
