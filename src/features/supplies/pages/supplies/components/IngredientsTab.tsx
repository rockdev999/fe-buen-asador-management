import { useState } from "react";
import { Plus } from "lucide-react";
import { useTableState } from "@/components/shared/DataTable/useTableState";
import { Button } from "@/components/shared/Basics/Button";
import { TableFilters } from "@/components/shared/DataTable/TableFilters";
import { DataTable } from "@/components/shared/DataTable/DataTable";
import { useIngredientsPage } from "../../../hooks/useIngredients";
import { IngredientListItem } from "../../../models/ingredient.model";
import { INGREDIENT_COLUMNS } from "../IngredientColumns";
import { IngredientModal } from "./IngredientModal";
import { Ingredient } from "../../../models/ingredient.model";

export const IngredientsTab = () => {
  const { page, filters, handleApply, handlePageChange } = useTableState();

  const [openModal, setOpenModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);

  const {
    data,
    meta,
    status: queryStatus,
    refetch,
  } = useIngredientsPage({
    page,
    search: filters.search ?? "",
  });

  const handleOpenCreateModal = () => {
    setSelectedIngredient(null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setSelectedIngredient(null);
    setOpenModal(false);
    refetch();
  };

  function handleApplyFilters(newFilters: Record<string, string>) {
    const isSame = JSON.stringify(newFilters) === JSON.stringify(filters);
    handleApply(newFilters);
    if (isSame) refetch();
  }

  const handleRowClick = (row: IngredientListItem) => {
    setSelectedIngredient({
      id: row.id,
      name: row.name,
      unitOfMeasure: row.unitOfMeasure,
      description: row.description,
      audit: { createdAt: row.createdAt, createdBy: null, updatedBy: null },
    });
    setOpenModal(true);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TableFilters
        searchPlaceholder="Buscar insumo..."
        onApply={handleApplyFilters}
        initialValues={filters}
        isLoading={queryStatus === "pending"}
        actions={
          <Button size="sm" onClick={handleOpenCreateModal}>
            <Plus size={13} />
            Nuevo insumo
          </Button>
        }
      />

      <DataTable
        columns={INGREDIENT_COLUMNS}
        data={data}
        meta={meta}
        isLoading={queryStatus === "pending"}
        onPageChange={handlePageChange}
        onRowClick={handleRowClick}
        rowKey={(row) => row.id}
        emptyMessage="No hay insumos"
        emptySubMessage="Crea el primer insumo con el botón de arriba"
      />

      {openModal && (
        <IngredientModal
          ingredient={selectedIngredient}
          onClose={handleCloseModal}
          onSuccess={handleCloseModal}
          key={selectedIngredient?.id ?? "default"}
        />
      )}
    </div>
  );
};
