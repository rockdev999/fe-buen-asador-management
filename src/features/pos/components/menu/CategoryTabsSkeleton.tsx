import { Skeleton } from "@/components/ui/skeleton";

interface CategoryTabsSkeletonProps {
  count?: number;
}

export function CategoryTabsSkeleton({ count = 6 }: CategoryTabsSkeletonProps) {
  return (
    <div className="flex bg-white border-b border-surface overflow-x-auto flex-shrink-0">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="px-3 py-2.5 flex-shrink-0">
          <Skeleton
            className="h-4 rounded-md"
            style={{
              width: `${60 + (index % 3) * 20}px`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
