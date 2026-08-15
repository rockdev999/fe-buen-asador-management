import { useMemo, useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { useTableState } from "@/components/shared/DataTable/useTableState";
import { TableFilters } from "@/components/shared/DataTable/TableFilters";
import { DataTable } from "@/components/shared/DataTable/DataTable";
import { Button } from "@/components/shared/Basics/Button";
import {
  AsyncDropdown,
  AsyncDropdownOption,
} from "@/components/shared/Interactives/AsyncDropdown";
import { useGetLocationSimple } from "@/features/locations/hooks/useLocation";
import { SortDirectionEnum } from "@/constants/enums/sort.enum";
import { useIngredientStockHandler } from "../../../hooks/useIngredientStock";
import { IngredientStock } from "../../../models/ingredient.model";
import { INGREDIENT_STOCK_DROPDOWNS } from "../../../config/ingredient.table";
import { getIngredientStockColumns } from "../IngredientStockColumns";
import { AdjustIngredientStockModal } from "./AdjustIngredientStockModal";
import { IngredientKardexModal } from "./IngredientKardexModal";
import { IngredientStockAlertsModal } from "./IngredientStockAlertsModal";
import { CreateIngredientStockModal } from "./CreateIngredientStockModal";

const PAGE_LIMIT = 10;

export const StockTab = () => {
  const {
    page,
    sortKey,
    sortDir,
    filters,
    handleSort,
    handleApply,
    handlePageChange,
  } = useTableState({
    defaultSortKey: "ingredient",
    defaultSortDir: SortDirectionEnum.ASC,
  });

  const { data: locations, status: locationsStatus } = useGetLocationSimple();

  const [locationId, setLocationId] = useState(filters.locationId ?? "");
  const [adjustStockItem, setAdjustStockItem] =
    useState<IngredientStock | null>(null);
  const [kardexItem, setKardexItem] = useState<IngredientStock | null>(null);
  const [openAlertsModal, setOpenAlertsModal] = useState(false);
  const [openCreateStockModal, setOpenCreateStockModal] = useState(false);

  const {
    data: stock,
    status: stockStatus,
    refetch,
  } = useIngredientStockHandler(locationId);

  const locationOptions: AsyncDropdownOption<{ id: string; name: string }>[] =
    (locations ?? []).map((loc) => ({
      id: loc.id,
      data: loc,
      searchText: loc.name,
      render: (item) => <span>{item.name}</span>,
    }));

  const filteredStock = useMemo(() => {
    const search = (filters.search ?? "").trim().toLowerCase();
    const stockLevel = filters.stockLevel ?? "";

    const filtered = (stock ?? []).filter((item) => {
      const matchesSearch =
        !search || item.ingredient.name.toLowerCase().includes(search);
      const isLow = item.currentQuantity < item.minimumStock;
      const matchesLevel =
        !stockLevel || (stockLevel === "low" ? isLow : !isLow);
      return matchesSearch && matchesLevel;
    });

    if (!sortKey || !sortDir) return filtered;

    const dir = sortDir === SortDirectionEnum.ASC ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "ingredient":
          return a.ingredient.name.localeCompare(b.ingredient.name) * dir;
        case "currentQuantity":
          return (a.currentQuantity - b.currentQuantity) * dir;
        case "minimumStock":
          return (a.minimumStock - b.minimumStock) * dir;
        case "updatedAt":
          return (
            (new Date(a.updatedAt).getTime() -
              new Date(b.updatedAt).getTime()) *
            dir
          );
        default:
          return 0;
      }
    });
  }, [stock, filters.search, filters.stockLevel, sortKey, sortDir]);

  const total = filteredStock.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const currentPage = Math.min(page, totalPages);
  const paginatedStock = filteredStock.slice(
    (currentPage - 1) * PAGE_LIMIT,
    currentPage * PAGE_LIMIT,
  );

  function handleApplyFilters(newFilters: Record<string, string>) {
    const isSame = JSON.stringify(newFilters) === JSON.stringify(filters);
    handleApply(newFilters);
    if (isSame) refetch();
  }

  const handleCloseAdjustModal = () => {
    setAdjustStockItem(null);
    refetch();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TableFilters
        searchPlaceholder="Buscar insumo..."
        onApply={handleApplyFilters}
        dropdowns={INGREDIENT_STOCK_DROPDOWNS}
        initialValues={filters}
        isLoading={stockStatus === "pending"}
        extraValues={{ locationId }}
        onClearExtra={() => setLocationId("")}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setOpenAlertsModal(true)}
            >
              <AlertTriangle size={13} />
              Alertas de stock
            </Button>
            <Button size="sm" onClick={() => setOpenCreateStockModal(true)}>
              <Plus size={13} />
              Nuevo stock
            </Button>
          </div>
        }
      >
        <AsyncDropdown
          placeholder="Sucursal"
          value={locationId ?? filters.locationId ?? ""}
          onChange={(id) => setLocationId(id)}
          options={locationOptions}
          isLoading={locationsStatus === "pending"}
          emptyText="Sin sucursales"
        />
      </TableFilters>

      <DataTable
        columns={getIngredientStockColumns({
          onAdjust: setAdjustStockItem,
          onKardex: setKardexItem,
        })}
        data={paginatedStock}
        meta={{ total, page: currentPage, limit: PAGE_LIMIT, totalPages }}
        isLoading={stockStatus === "pending"}
        onPageChange={handlePageChange}
        onSort={handleSort}
        sortKey={sortKey}
        sortDir={sortDir}
        rowKey={(row) => row.id}
        emptyMessage="No hay insumos en inventario"
        emptySubMessage="Selecciona una sucursal para ver el stock disponible"
      />

      {adjustStockItem && (
        <AdjustIngredientStockModal
          stockItem={adjustStockItem}
          onClose={() => setAdjustStockItem(null)}
          onSuccess={handleCloseAdjustModal}
        />
      )}

      {kardexItem && (
        <IngredientKardexModal
          stockItem={kardexItem}
          onClose={() => setKardexItem(null)}
        />
      )}

      {openAlertsModal && (
        <IngredientStockAlertsModal
          locationId={locationId}
          onClose={() => setOpenAlertsModal(false)}
        />
      )}

      {openCreateStockModal && (
        <CreateIngredientStockModal
          locations={locations}
          defaultLocationId={locationId}
          onClose={() => setOpenCreateStockModal(false)}
          onSuccess={() => {
            setOpenCreateStockModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
};
