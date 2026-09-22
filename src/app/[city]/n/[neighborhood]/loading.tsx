import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingGridSkeleton } from "@/components/ListingGridSkeleton";

export default function Loading() {
  return (
    <Container className="py-7 space-y-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-40" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-32 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>
      <ListingGridSkeleton />
    </Container>
  );
}
