import { Container, Heading, Text, Flex } from "@radix-ui/themes";
import { ReportForm } from "./ReportForm";

export const dynamic = "force-dynamic";

export default async function ReportPage(
  { searchParams }: { searchParams: Promise<{ listing?: string }> },
) {
  const sp = await searchParams;
  const listingId = sp.listing ?? "";

  return (
    <Container size="1" px="4" py="6">
      <Flex direction="column" gap="3">
        <Heading size="5">Report a listing</Heading>
        <Text size="2" color="gray">
          Tell us what&apos;s wrong. We&apos;ll review and take action if needed.
        </Text>
        <ReportForm listingId={listingId} />
      </Flex>
    </Container>
  );
}
