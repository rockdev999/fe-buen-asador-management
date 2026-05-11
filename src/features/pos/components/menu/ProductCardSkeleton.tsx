import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridSkeletonProps {
  count?: number;
}

function ProductCardSkeleton() {
  return (
    <div className="flex h-[190px] w-[170px] flex-col items-center justify-between gap-2 rounded-2xl border border-surface bg-white p-3 text-center">
      <Skeleton className="h-[95px] w-full rounded-xl" />

      <div className="flex w-full flex-col items-center gap-1.5">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>

      <Skeleton className="h-5 w-20" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 12 }: ProductGridSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </>
  );
}
