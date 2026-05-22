import { Skeleton } from "@/components/ui/skeleton";

interface LocationStepOneSkeletonProps {
  showDeactivateBox?: boolean;
}

export const LocationModalSkeleton = ({
  showDeactivateBox = false,
}: LocationStepOneSkeletonProps) => {
  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex flex-shrink-0 items-start justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />

          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>

        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>

      {/* Steps */}
      <div className="flex flex-shrink-0 gap-3 border-y border-surface bg-white px-5 py-4">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-brand/30 bg-brand/10 p-3">
          <Skeleton className="h-9 w-9 rounded-lg" />

          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        <div className="flex flex-1 items-center gap-3 rounded-xl border border-surface bg-white p-3">
          <Skeleton className="h-9 w-9 rounded-lg" />

          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-5 py-4">
        {/* Section title */}
        <div className="mb-4 space-y-2">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-3 w-72 max-w-full" />
        </div>

        {/* Form inputs */}
        <div className="space-y-4">
          <FormFieldSkeleton />
          <FormFieldSkeleton />
        </div>

        {/* Deactivate box */}
        {showDeactivateBox && (
          <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Skeleton className="mt-1 h-4 w-4 shrink-0 rounded-md" />

                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-64 max-w-full" />
                  <Skeleton className="h-3 w-44 max-w-full" />
                </div>
              </div>

              <Skeleton className="h-9 w-36 shrink-0 rounded-full" />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-shrink-0 items-center justify-between border-t border-surface bg-surface/30 px-5 py-3">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>
    </div>
  );
};

function FormFieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3.5 w-36" />

      <div className="relative">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 rounded-md" />
      </div>
    </div>
  );
}
