import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { TableFilters } from "@/components/shared/DataTable/TableFilters";
import { DataTable } from "@/components/shared/DataTable/DataTable";
import { Button } from "@/components/shared/Basics/Button";
import {
  AsyncDropdown,
  AsyncDropdownOption,
} from "@/components/shared/Interactives/AsyncDropdown";
import { useProductsHandler } from "@/features/catalog/products/hooks/useProducts";
import { useRecipesByProductHandler, useRecipesHandler } from "../../../hooks/useRecipes";
import { Recipe } from "../../../models/recipe.model";
import { RECIPE_COLUMNS } from "../RecipeColumns";
import { RecipeModal } from "./RecipeModal";

const PAGE_LIMIT = 10;

export const RecipesTab = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [productId, setProductId] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const { data: products, status: productsStatus } = useProductsHandler();

  const allRecipes = useRecipesHandler(!productId);
  const productRecipes = useRecipesByProductHandler(productId || null, {
    enabled: !!productId,
  });

  const recipes = productId ? productRecipes.data : allRecipes.data;
  const isLoading = productId
    ? productRecipes.status === "pending"
    : allRecipes.status === "pending";
  const refetch = productId ? productRecipes.refetch : allRecipes.refetch;

  const productOptions: AsyncDropdownOption<{ id: string; name: string }>[] =
    (products ?? []).map((product) => ({
      id: product.id,
      data: product,
      searchText: product.name,
      render: (item) => <span>{item.name}</span>,
    }));

  const filteredRecipes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return recipes ?? [];
    return (recipes ?? []).filter(
      (recipe) =>
        recipe.ingredient.name.toLowerCase().includes(normalizedSearch) ||
        recipe.product.name.toLowerCase().includes(normalizedSearch),
    );
  }, [recipes, search]);

  const total = filteredRecipes.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const currentPage = Math.min(page, totalPages);
  const paginatedRecipes = filteredRecipes.slice(
    (currentPage - 1) * PAGE_LIMIT,
    currentPage * PAGE_LIMIT,
  );

  const handleOpenCreateModal = () => {
    setSelectedRecipe(null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setSelectedRecipe(null);
    setOpenModal(false);
    refetch();
  };

  const handleRowClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setOpenModal(true);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TableFilters
        searchPlaceholder="Buscar por producto o insumo..."
        onApply={(filters) => {
          setSearch(filters.search ?? "");
          setPage(1);
        }}
        initialValues={{ search }}
        isLoading={isLoading}
        extraValues={{ productId }}
        onClearExtra={() => {
          setProductId("");
          setPage(1);
        }}
        actions={
          <Button size="sm" onClick={handleOpenCreateModal}>
            <Plus size={13} />
            Nueva receta
          </Button>
        }
      >
        <AsyncDropdown
          placeholder="Producto"
          value={productId}
          onChange={(id) => {
            setProductId(id);
            setPage(1);
          }}
          options={productOptions}
          isLoading={productsStatus === "pending"}
          emptyText="Sin productos"
        />
      </TableFilters>

      <DataTable
        columns={RECIPE_COLUMNS}
        data={paginatedRecipes}
        meta={{ total, page: currentPage, limit: PAGE_LIMIT, totalPages }}
        isLoading={isLoading}
        onPageChange={setPage}
        rowKey={(row) => row.id}
        onRowClick={handleRowClick}
        emptyMessage="No hay recetas"
        emptySubMessage="Crea la primera receta con el botón de arriba"
      />

      {openModal && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={handleCloseModal}
          onSuccess={handleCloseModal}
          key={selectedRecipe?.id ?? "default"}
        />
      )}
    </div>
  );
};
