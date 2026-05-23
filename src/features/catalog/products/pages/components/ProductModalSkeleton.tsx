import { Skeleton } from "@/components/ui/skeleton";

export function ProductModalSkeleton() {
  return (
    <div className="flex max-h-[90vh] flex-col overflow-hidden rounded-3xl bg-white">
      {/* Header */}
      <div className="flex flex-shrink-0 items-start justify-between border-b border-surface px-6 py-5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-11 w-11 rounded-2xl" />

          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3.5 w-80 max-w-full" />
          </div>
        </div>

        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>

      {/* Body */}
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        {/* Datos del producto */}
        <FormSectionSkeleton titleWidth="w-44" />

        <div className="space-y-4">
          <FieldSkeleton className="w-full" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FieldSkeleton />
            <MoneyFieldSkeleton />
          </div>

          <TextareaFieldSkeleton />
        </div>

        {/* Clasificación */}
        <div className="border-t border-surface pt-4">
          <FormSectionSkeleton titleWidth="w-36" descriptionWidth="w-72" />

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <SelectFieldSkeleton />
            <SelectFieldSkeleton />
          </div>
        </div>

        {/* Imagen y orden */}
        <div className="border-t border-surface pt-4">
          <FormSectionSkeleton titleWidth="w-40" descriptionWidth="w-96" />

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-shrink-0 items-center justify-between border-t border-surface bg-white px-6 py-4">
        <Skeleton className="h-11 w-28 rounded-xl" />
        <Skeleton className="h-11 w-40 rounded-xl" />
      </div>
    </div>
  );
}

interface FormSectionSkeletonProps {
  titleWidth?: string;
  descriptionWidth?: string;
}

function FormSectionSkeleton({
  titleWidth = "w-40",
  descriptionWidth = "w-80",
}: FormSectionSkeletonProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-3.5 w-3.5 rounded-sm" />
        <Skeleton className={`h-3.5 ${titleWidth}`} />
      </div>

      <Skeleton className={`h-3.5 ${descriptionWidth} max-w-full`} />
    </div>
  );
}

interface FieldSkeletonProps {
  className?: string;
}

function FieldSkeleton({ className }: FieldSkeletonProps) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-center gap-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-2 rounded-full" />
      </div>

      <Skeleton className="h-12 w-full rounded-2xl" />
    </div>
  );
}

function MoneyFieldSkeleton() {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-2 rounded-full" />
      </div>

      <div className="relative">
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="absolute left-4 top-1/2 h-4 w-8 -translate-y-1/2" />
        <Skeleton className="absolute right-4 top-1/2 h-4 w-12 -translate-y-1/2" />
      </div>
    </div>
  );
}

function TextareaFieldSkeleton() {
  return (
    <div>
      <Skeleton className="mb-2 h-4 w-24" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="mt-2 h-3.5 w-80 max-w-full" />
    </div>
  );
}

function SelectFieldSkeleton() {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-2 rounded-full" />
      </div>

      <div className="relative">
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 rounded-sm" />
        <Skeleton className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rounded-sm" />
      </div>
    </div>
  );
}
