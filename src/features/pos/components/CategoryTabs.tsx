import { Category } from "@/features/categories/models/category.model";
import { cn } from "@/lib/utils";

const ALL = { id: "all", name: "Todos" };

interface CategoryTabsProps {
  categories: Category[];
  selected: string;
  onSelect: (id: string) => void;
}

export function CategoryTabs({
  categories,
  selected,
  onSelect,
}: CategoryTabsProps) {
  const tabs = [ALL, ...categories];
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
