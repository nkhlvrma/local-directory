import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingGridSkeleton } from "@/components/ListingGridSkeleton";

export default function Loading() {
  return (
    <Container className="py-7 space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-11 w-full rounded-lg" />
      <ListingGridSkeleton count={4} />
    </Container>
  );
}
