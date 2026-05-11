import { Skeleton } from "@/components/ui/skeleton";

interface CartPanelSkeletonProps {
  itemCount?: number;
}

export function CartPanelSkeleton({ itemCount = 4 }: CartPanelSkeletonProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Order type buttons */}
      <div className="flex flex-shrink-0 gap-1 border-b border-surface p-2.5">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-9 flex-1 rounded-lg" />
        ))}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="space-y-2">
          {Array.from({ length: itemCount }).map((_, index) => (
            <CartItemSkeleton key={index} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-surface p-3">
        <div className="mb-3 me-3 flex justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>

        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    </div>
  );
}

function CartItemSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-surface bg-white p-2.5">
      <Skeleton className="h-12 w-12 flex-shrink-0 rounded-lg" />

      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
        <Skeleton className="h-3 w-16" />
      </div>

      <div className="flex flex-shrink-0 flex-col items-end gap-2">
        <Skeleton className="h-4 w-14" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-6 w-6 rounded-md" />
          <Skeleton className="h-6 w-8 rounded-md" />
          <Skeleton className="h-6 w-6 rounded-md" />
        </div>
      </div>
    </div>
  );
}
