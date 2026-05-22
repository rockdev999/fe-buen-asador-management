import { MenuCategory } from "@/features/catalog/categories/models/category.model";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  categories: MenuCategory[];
  selected: MenuCategory | null;
  onSelect: (category: MenuCategory) => void;
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
          onClick={() => onSelect(cat)}
          className={cn(
            "px-3 py-2.5 text-lg font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0",
            selected?.id === cat.id
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
