import { useCategoriesHandler } from "@/features/categories/hooks/useCategories";
import { ShiftModal } from "../components/ShiftModal";
import { useActiveShift } from "../hooks/useShift";
import { CategoryTabs } from "../components/CategoryTabs";
import { useState } from "react";
import { useProductsHandler } from "@/features/products/hooks/useProducts";
import { ProductGrid } from "../components/products/ProductGrid";
import { Product } from "@/features/products/models/product.model";
import { useCartStore } from "../stores/cart.store";

export const Pos = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { addItem } = useCartStore();

  const {
    // data: activeShift,
    status: activeShiftStatus,
    isOpen: isShiftOpen,
  } = useActiveShift();

  const { data: categories, status: categoriesStatus } =
    useCategoriesHandler(isShiftOpen);
  const { data: products, status: prodStatus } =
    useProductsHandler(isShiftOpen);

  const changeCategory = (id: string) => {
    setSelectedCategory(id);
  };

  if (activeShiftStatus === "pending") {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  function handleAddItem(product: Product) {
    addItem(product);
  }

  return (
    <div className="relative h-full">
      {!isShiftOpen && <ShiftModal />}

      <div>
        <h1>POS</h1>
        {categories && (
          <CategoryTabs
            categories={categories}
            selected={selectedCategory}
            onSelect={changeCategory}
          />
        )}
        {products && (
          <ProductGrid
            categories={categories ?? []}
            products={products ?? []}
            onAddItem={handleAddItem}
          />
        )}
      </div>
    </div>
  );
};
