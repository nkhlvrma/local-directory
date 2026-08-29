import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

// Deliberately not behind requireAdmin: someone who can't sign in is
// exactly who needs this page.
export default function AdminForgotPasswordPage() {
  return (
    <Container size="sm" className="py-16 space-y-6 max-w-sm mx-auto">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight font-heading">Reset password</h1>
        <p className="text-muted-foreground text-sm">
          We&apos;ll email you a link to set a new one.
        </p>
      </header>
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
    </Container>
  );
}
