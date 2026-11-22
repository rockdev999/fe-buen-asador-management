import { useMemo, useState } from "react";
import { CategoryTabs } from "./CategoryTabs";
import { ProductCard } from "./ProductCard";
import { t } from "@/locales/es";
import { useGetMenuHandler } from "../../../catalog/categories/hooks/useCategories";
import { CategoryTabsSkeleton } from "./CategoryTabsSkeleton";
import {
  CategoryProduct,
  MenuCategory,
} from "../../../catalog/categories/models/category.model";
import { ProductGridSkeleton } from "./ProductCardSkeleton";

const trans = t.pos.products;

interface ProductGridProps {
  isOpen: boolean;
  onAddItem: (product: CategoryProduct) => void;
}

export function ProductGrid({ isOpen, onAddItem }: ProductGridProps) {
  const { data: menu, status: menuStatus } = useGetMenuHandler(isOpen);

  // Se guarda solo el id: los productos se leen siempre del menú actual. Antes
  // se guardaba la categoría entera y, al refrescarse el menú (p. ej. por
  // catalog-updated), la pestaña abierta seguía mostrando precios y productos viejos.
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const activeSelectedCat = useMemo(() => {
    if (!menu || menu.length === 0) return null;
    return menu.find((cat) => cat.id === selectedCatId) ?? menu[0];
  }, [menu, selectedCatId]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {menuStatus === "pending" || !menu ? (
        <CategoryTabsSkeleton count={4} />
      ) : menu.length === 0 ? (
        <div className="flex items-center justify-center h-12 text-xs text-muted-foreground">
          {trans.noCategories}
        </div>
      ) : (
        menu.length > 0 && (
          <CategoryTabs
            categories={menu}
            selected={activeSelectedCat ?? menu[0]}
            onSelect={(cat: MenuCategory) => setSelectedCatId(cat.id)}
          />
        )
      )}

      <div className="flex-1 overflow-y-auto bg-surface py-3">
        <div
          className="grid justify-start gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fill, 200px)",
          }}
        >
          {menuStatus === "pending" || !menu ? (
            <ProductGridSkeleton count={8} />
          ) : activeSelectedCat?.products.length === 0 ? (
            <div className="col-span-full flex h-12 items-center justify-center text-xs text-muted-foreground">
              {trans.noProducts}
            </div>
          ) : (
            activeSelectedCat?.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={onAddItem}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
