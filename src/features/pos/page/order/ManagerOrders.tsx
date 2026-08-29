import { useState } from "react";
import { useTableState } from "@/components/shared/DataTable/useTableState";
import { PageHeader } from "@/components/shared/DataTable/PageHeader";
import { TableFilters } from "@/components/shared/DataTable/TableFilters";
import { DataTable } from "@/components/shared/DataTable/DataTable";
import {
  AsyncDropdown,
  AsyncDropdownOption,
} from "@/components/shared/Interactives/AsyncDropdown";
import { SingleDatePicker } from "@/components/shared/Interactives/datePicker.tsx/DatePicker";
import { useGetLocationSimple } from "@/features/locations/hooks/useLocation";
import { useManagerOrdersPage } from "../../hooks/useOrder";
import { MANAGER_ORDERS_COLUMNS, ORDERS_TABLE_CONFIG } from "./OrderColumns";
import { MANAGER_ORDER_DROPDOWNS } from "../../config/orders.table";

export function ManagerOrders() {
  const {
    page,
    sortKey,
    sortDir,
    filters,
    handleSort,
    handleApply,
    handlePageChange,
  } = useTableState({
    defaultSortKey: ORDERS_TABLE_CONFIG.defaultSorting.columnKey,
    defaultSortDir: ORDERS_TABLE_CONFIG.defaultSorting.direction,
  });

  const { data: locations, status: locationsStatus } = useGetLocationSimple();

  const [locationId, setLocationId] = useState(filters.locationId ?? "");
  const [updatedDate, setUpdatedDate] = useState(filters.updatedDate ?? "");

  const {
    data,
    meta,
    status: queryStatus,
    refetch,
  } = useManagerOrdersPage({
    page,
    search: filters.search ?? "",
    status: filters.status ?? "",
    type: filters.type ?? "",
    channel: filters.channel ?? "",
    locationId: filters.locationId ?? "",
    updatedDate: filters.updatedDate ?? "",
    includeAll: filters.includeAll === "true",
    sortKey,
    sortDir,
  });

  const locationOptions: AsyncDropdownOption<{ id: string; name: string }>[] =
    (locations ?? []).map((loc) => ({
      id: loc.id,
      data: loc,
      searchText: loc.name,
      render: (item) => <span>{item.name}</span>,
    }));

  function handleApplyFilters(newFilters: Record<string, string>) {
    const isSame = JSON.stringify(newFilters) === JSON.stringify(filters);
    handleApply(newFilters);
    if (isSame) refetch();
  }

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-2xl">
      <PageHeader
        title="Pedidos"
        subtitle="Vista global de pedidos de todas las sucursales"
      />

      <TableFilters
        searchPlaceholder="Buscar por cliente, teléfono o dirección..."
        onApply={handleApplyFilters}
        dropdowns={MANAGER_ORDER_DROPDOWNS}
        initialValues={filters}
        isLoading={queryStatus === "pending"}
        extraValues={{ locationId, updatedDate }}
        onClearExtra={() => {
          setLocationId("");
          setUpdatedDate("");
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
        <SingleDatePicker
          value={updatedDate}
          onChange={setUpdatedDate}
          placeholder="Fecha"
          max={new Date().toISOString().split("T")[0]}
        />
      </TableFilters>

      <DataTable
        columns={MANAGER_ORDERS_COLUMNS}
        data={data}
        meta={meta}
        isLoading={queryStatus === "pending"}
        onPageChange={handlePageChange}
        onSort={handleSort}
        sortKey={sortKey}
        sortDir={sortDir}
        rowKey={(row) => row.id}
        emptyMessage="No hay pedidos"
        emptySubMessage="Intenta cambiar los filtros"
      />
    </div>
  );
}
