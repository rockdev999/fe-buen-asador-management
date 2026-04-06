import { Category } from "@/features/categories/models/category.model";
import { cn } from "@/lib/utils";
import { UUID } from "@/types/common";

interface CategoryTabsProps {
  categories: Category[];
  selected: UUID | null;
  onSelect: (id: UUID) => void;
}

export function CategoryTabs({
  categories,
  selected,
  onSelect,
}: CategoryTabsProps) {
  const tabs = [...categories];

  return (
    <div className="flex bg-white border-b border-surface overflow-x-auto flex-shrink-0">
      {tabs.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.id)}
          className={cn(
            "px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0",
            selected === cat.id
              ? "text-brand border-brand"
              : "text-muted-foreground border-transparent hover:text-brand",
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
