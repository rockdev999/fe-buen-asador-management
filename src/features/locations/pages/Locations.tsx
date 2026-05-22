import { useTableState } from "@/components/shared/DataTable/useTableState";
import { DATA_TABLE } from "@/constants";
import { useState } from "react";
import { useLocationsPage } from "../hooks/useLocation";
import { LocationPageItem } from "../models/location.model";
import { PageHeader } from "@/components/shared/DataTable/PageHeader";
import { Button } from "@/components/shared/Basics/Button";
import { Plus } from "lucide-react";
import { TableFilters } from "@/components/shared/DataTable/TableFilters";
import { LOCATION_DROPDOWNS } from "../config/location.table";
import { DataTable } from "@/components/shared/DataTable/DataTable";
import { LOCATION_COLUMNS } from "./LocationColumns";
import { LocationModal } from "./components/LocationModal";

export const Locations = () => {
  const {
    page,
    sortKey,
    sortDir,
    filters,
    handleSort,
    handleApply,
    handlePageChange,
  } = useTableState({
    defaultSortKey: DATA_TABLE.LOCATIONS.defaultSorting.columnKey,
    defaultSortDir: DATA_TABLE.LOCATIONS.defaultSorting.direction,
  });

  const [openLocationModal, setOpenLocationModal] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [locationId, setLocationId] = useState(filters.locationId ?? "");

  const {
    data,
    meta,
    status: queryStatus,
    refetch,
  } = useLocationsPage({
    page,
    search: filters.search ?? "",
    name: filters.name ?? "",
    active: filters.active ? filters.active === "true" : undefined,
    sortKey,
    sortDir,
  });

  const handleOpenCreateModal = () => {
    setSelectedLocationId(null);
    setOpenLocationModal(true);
  };

  const handleCloseLocationModal = () => {
    setSelectedLocationId(null);
    setOpenLocationModal(false);
    refetch();
  };

  function handleApplyFilters(newFilters: Record<string, string>) {
    const isSame = JSON.stringify(newFilters) === JSON.stringify(filters);
    handleApply(newFilters);
    if (isSame) refetch();
  }

  const handleRowClick = (data: LocationPageItem) => {
    setSelectedLocationId(data.id);
    setOpenLocationModal(true);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Sucursales"
        actions={
          <Button size="sm" onClick={handleOpenCreateModal}>
            <Plus size={13} />
            Nueva sucursal
          </Button>
        }
      />

      <TableFilters
        searchPlaceholder="Buscar por nombre o correo..."
        onApply={handleApplyFilters}
        dropdowns={LOCATION_DROPDOWNS}
        initialValues={filters}
        isLoading={queryStatus === "pending"}
        extraValues={{ locationId }}
        onClearExtra={() => {
          setLocationId("");
        }}
      />

      <DataTable
        columns={LOCATION_COLUMNS}
        data={data}
        meta={meta}
        isLoading={queryStatus === "pending"}
        onPageChange={handlePageChange}
        onSort={handleSort}
        sortKey={sortKey}
        sortDir={sortDir}
        onRowClick={(data) => handleRowClick(data)}
        rowKey={(row) => row.id}
        emptyMessage="No hay sucursales"
        emptySubMessage="Crea la primera sucursal con el botón de arriba"
      />

      {openLocationModal && (
        <LocationModal
          locationId={selectedLocationId}
          onClose={handleCloseLocationModal}
          onSuccess={handleCloseLocationModal}
          key={selectedLocationId ?? "default"}
        />
      )}
    </div>
  );
};
