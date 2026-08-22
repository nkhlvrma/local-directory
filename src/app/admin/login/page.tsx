import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-10 space-y-4">
      <h1 className="text-xl font-semibold">Admin sign in</h1>
      <LoginForm />
    </div>
  );
}
