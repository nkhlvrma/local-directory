import Link from "next/link";
import { Info } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <Container size="sm" className="py-10 space-y-4">
      <h1 className="text-xl font-semibold">Admin sign in</h1>

      {isDemo ? (
        <Alert>
          <Info className="size-4" />
          <AlertDescription className="space-y-3">
            <p>
              <strong>Demo mode.</strong> No credentials needed — the app is
              running on in-memory data. Enter as admin to explore the full flow;
              edits won&apos;t persist.
            </p>
            <Link href="/admin">
              <Button>Enter as demo admin →</Button>
            </Link>
          </AlertDescription>
        </Alert>
      ) : (
        <LoginForm />
      )}
    </Container>
  );
}
