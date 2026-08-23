import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <div className="mx-auto max-w-sm px-4 py-10 space-y-4">
      <h1 className="text-xl font-semibold">Admin sign in</h1>

      {isDemo ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm space-y-3">
          <p>
            <strong>Demo mode.</strong> No credentials needed — the app is
            running on in-memory data. Enter as admin to explore the full flow;
            edits won&apos;t persist.
          </p>
          <Link
            href="/admin"
            className="inline-block rounded-full bg-foreground text-background px-4 py-2 text-sm"
          >
            Enter as demo admin →
          </Link>
        </div>
      ) : (
        <LoginForm />
      )}
    </div>
  );
}
