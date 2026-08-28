import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { LoginForm } from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <Container size="sm" className="py-16 space-y-6 max-w-sm mx-auto">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight font-heading">Admin</h1>
        <p className="text-muted-foreground text-sm">Sign in to review listings.</p>
      </header>
      <Suspense>
        <LoginForm />
      </Suspense>
    </Container>
  );
}
