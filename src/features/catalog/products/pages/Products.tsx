import { useTableState } from "@/components/shared/DataTable/useTableState";
import { DATA_TABLE } from "@/constants";
import { useState } from "react";
import { useProductsPage } from "../hooks/useProducts";
import { ProductPageItem } from "../models/product.model";
import { PageHeader } from "@/components/shared/DataTable/PageHeader";
import { Button } from "@/components/shared/Basics/Button";
import { Plus } from "lucide-react";
import { TableFilters } from "@/components/shared/DataTable/TableFilters";
import { DataTable } from "@/components/shared/DataTable/DataTable";
import { PRODUCT_DROPDOWNS } from "../config/product.table";
import {
  AsyncDropdown,
  AsyncDropdownOption,
} from "@/components/shared/Interactives/AsyncDropdown";
import { PRODUCT_COLUMNS } from "./ProductColumns";
import { useGetLocationSimple } from "@/features/locations/hooks/useLocation";
import { useCategoriesSimpleHandler } from "../../categories/hooks/useCategories";
import { ProductModal } from "./components/ProductModal";

export const Products = () => {
  const {
    page,
    sortKey,
    sortDir,
    filters,
    handleSort,
    handleApply,
    handlePageChange,
  } = useTableState({
    defaultSortKey: "default",
    defaultSortDir: DATA_TABLE.PRODUCTS.defaultSorting.direction,
  });
  const { data: locations, status: locationsStatus } = useGetLocationSimple();
  const { data: categories, status: categoriesStatus } =
    useCategoriesSimpleHandler();

  const [locationId, setLocationId] = useState(filters.locationId ?? "");
  const [categoryId, setCategoryId] = useState(filters.categoryId ?? "");
  const [openProductModal, setOpenProductModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  const {
    data,
    meta,
    status: queryStatus,
    refetch,
  } = useProductsPage({
    page,
    search: filters.search ?? "",
    locationId: filters.locationId ?? "",
    categoryId: filters.categoryId ?? "",
    available: filters.available ?? "",
    sortKey,
    sortDir,
  });

  const locationOptions: AsyncDropdownOption<{ id: string; name: string }>[] = (
    locations ?? []
  ).map((loc) => ({
    id: loc.id,
    data: loc,
    searchText: loc.name,
    render: (item) => <span>{item.name}</span>,
  }));

  const categoryOptions: AsyncDropdownOption<{ id: string; name: string }>[] = (
    categories ?? []
  ).map((cat) => ({
    id: cat.id,
    data: cat,
    searchText: cat.name,
    render: (item) => <span>{item.name}</span>,
  }));

  const handleOpenCreateModal = () => {
    setSelectedProductId(null);
    setOpenProductModal(true);
  };

  const handleCloseProductModal = () => {
    setSelectedProductId(null);
    setOpenProductModal(false);
    refetch();
  };

  function handleApplyFilters(newFilters: Record<string, string>) {
    const isSame = JSON.stringify(newFilters) === JSON.stringify(filters);
    handleApply(newFilters);
    if (isSame) refetch();
  }

  const handleRowClick = (data: ProductPageItem) => {
    setSelectedProductId(data.id);
    setOpenProductModal(true);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Productos"
        actions={
          <Button size="sm" onClick={handleOpenCreateModal}>
            <Plus size={13} />
            Nuevo producto
          </Button>
        }
      />

      <TableFilters
        searchPlaceholder="Buscar por nombre o correo..."
        onApply={handleApplyFilters}
        dropdowns={PRODUCT_DROPDOWNS}
        initialValues={filters}
        isLoading={queryStatus === "pending"}
        extraValues={{ locationId, categoryId }}
        onClearExtra={() => {
          setLocationId("");
          setCategoryId("");
        }}
      >
        <AsyncDropdown
          placeholder="Sucursal"
          value={locationId ?? filters.locationId ?? ""}
          onChange={(id) => setLocationId(id)}
          options={locationOptions}
          isLoading={locationsStatus === "pending"}
          emptyText="Sin sucursales"
        />
        <AsyncDropdown
          placeholder="Categoría"
          value={categoryId ?? filters.categoryId ?? ""}
          onChange={(id) => setCategoryId(id)}
          options={categoryOptions}
          isLoading={categoriesStatus === "pending"}
          emptyText="Sin categorías"
        />
      </TableFilters>

      <DataTable
        columns={PRODUCT_COLUMNS}
        data={data}
        meta={meta}
        isLoading={queryStatus === "pending"}
        onPageChange={handlePageChange}
        onSort={handleSort}
        sortKey={sortKey}
        sortDir={sortDir}
        onRowClick={(data) => handleRowClick(data)}
        rowKey={(row) => row.id}
        emptyMessage="No hay productos"
        emptySubMessage="Crea el primer producto con el botón de arriba"
      />

      {openProductModal && (
        <ProductModal
          productId={selectedProductId}
          categories={categories}
          locations={locations}
          onClose={handleCloseProductModal}
          onSuccess={handleCloseProductModal}
          key={selectedProductId ?? "default"}
        />
      )}
    </div>
  );
};
