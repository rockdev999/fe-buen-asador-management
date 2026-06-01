export function ModifierModalSkeleton() {
  return (
    <div className="px-5 py-4 flex flex-col gap-4 animate-pulse">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 bg-surface rounded" />
        <div className="h-3 w-28 bg-surface rounded" />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="h-2.5 w-16 bg-surface rounded" />
        <div className="h-9 bg-surface rounded-xl" />
      </div>
      <div className="h-24 bg-surface rounded-2xl" />
    </div>
  );
}
