import { useMemo, useState } from "react";
import { FolderTree, Plus, Search, X } from "lucide-react";

import { Button } from "@/components/shared/Basics/Button";
import { CategoryCard } from "./components/CategoryCard";
import { useCategoriesHandler } from "../hooks/useCategories";
import { Category } from "../models/category.model";
import { CategoryModal } from "./components/CategoryModal";

export function Categories() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: categories, refetch } = useCategoriesHandler();

  const categoryList = categories ?? [];

  const filteredCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return categoryList
      .filter((category) =>
        category.name.toLowerCase().includes(normalizedSearch),
      )
      .sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder));
  }, [categoryList, search]);

  const hasSearch = search.trim().length > 0;

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCategory(null);
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    handleCloseModal();
    refetch();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-surface bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col items-start gap-0">
          <h1 className="text-base font-semibold text-inkblack">Categorías</h1>
          <span className="text-[11px] text-muted-foreground">
            {filteredCategories.length} categoría
            {filteredCategories.length === 1 ? "" : "s"}
          </span>
        </div>

        <Button
          type="button"
          onClick={handleCreate}
          className="h-9 rounded-xl px-4 text-[12px] font-medium"
        >
          <Plus size={14} />
          Nueva categoría
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-surface bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar categoría..."
            className="h-9 w-full rounded-xl border border-surface bg-surface/30 py-2 pl-9 pr-9 text-[13px] text-inkblack outline-none transition-all placeholder:text-muted-foreground/40 focus:border-brand/40 focus:bg-white focus:ring-2 focus:ring-brand/20"
          />

          {hasSearch && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-muted-foreground/40 transition-colors hover:text-muted-foreground"
              aria-label="Limpiar búsqueda"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {filteredCategories.length === 0 ? (
        <EmptyCategoriesState hasSearch={hasSearch} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <CategoryModal
          category={selectedCategory}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

interface EmptyCategoriesStateProps {
  hasSearch: boolean;
}

function EmptyCategoriesState({ hasSearch }: EmptyCategoriesStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-surface bg-white px-6 py-10 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-muted-foreground">
        <FolderTree size={20} />
      </div>

      <h2 className="mt-4 text-sm font-semibold text-inkblack">
        {hasSearch ? "No se encontraron categorías" : "No hay categorías"}
      </h2>

      <p className="mx-auto mt-1 max-w-sm text-[12px] text-muted-foreground">
        {hasSearch
          ? "Intenta buscar con otro nombre o limpia el filtro."
          : "Crea tu primera categoría para empezar a organizar los productos del catálogo."}
      </p>
    </div>
  );
}
