import Link from "next/link";
import { Container, Heading, Callout, Flex, Text, Button } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <Container size="1" px="4" py="6">
      <Flex direction="column" gap="4">
        <Heading size="5">Admin sign in</Heading>

        {isDemo ? (
          <Callout.Root color="amber">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              <Text as="p" size="2" mb="3">
                <strong>Demo mode.</strong> No credentials needed — the app is
                running on in-memory data. Enter as admin to explore the full
                flow; edits won&apos;t persist.
              </Text>
              <Link href="/admin" style={{ textDecoration: "none" }}>
                <Button>Enter as demo admin →</Button>
              </Link>
            </Callout.Text>
          </Callout.Root>
        ) : (
          <LoginForm />
        )}
      </Flex>
    </Container>
  );
}
