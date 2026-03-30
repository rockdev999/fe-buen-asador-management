import { Input } from "@/components/ui/input";
import { Category } from "@/features/categories/models/category.model";
import { Product } from "@/features/products/models/product.model";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { CategoryTabs } from "../CategoryTabs";
import { ProductCard } from "../ProductCard";

interface ProductGridProps {
  categories: Category[];
  products: Product[];
  onAddItem: (product: Product) => void;
}

export function ProductGrid({
  categories,
  products,
  onAddItem,
}: ProductGridProps) {
  const [selectedCat, setSelectedCat] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const matchCat = selectedCat === "all" || p.id === selectedCat;
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
      }),
    [products, selectedCat, search],
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="p-2 bg-white border-b border-surface flex-shrink-0">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="pl-7 h-8 text-xs bg-surface border-surface focus-visible:border-brand focus-visible:ring-0"
          />
        </div>
      </div>

      <CategoryTabs
        categories={categories}
        selected={selectedCat}
        onSelect={setSelectedCat}
      />

      <div className="flex-1 overflow-y-auto p-2.5 bg-surface">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            Sin productos
          </div>
        ) : (
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
            }}
          >
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={onAddItem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
