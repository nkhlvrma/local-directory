"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, Button, Flex, Callout } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setPending(true);
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        setPending(false);
        if (error) setError(error.message);
        else router.replace("/admin");
      }}
    >
      <Flex direction="column" gap="3">
        <TextField.Root
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField.Root
          type="password"
          required
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? (
          <Callout.Root color="red">
            <Callout.Icon>
              <ExclamationTriangleIcon />
            </Callout.Icon>
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        ) : null}
        <div>
          <Button type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </div>
      </Flex>
    </form>
  );
}
