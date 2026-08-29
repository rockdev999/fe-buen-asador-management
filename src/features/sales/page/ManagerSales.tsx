import { useState } from "react";
import { useGetSaleById, useManagerSalesPage } from "../hooks/useSale";
import { PageHeader } from "@/components/shared/DataTable/PageHeader";
import { TableFilters } from "@/components/shared/DataTable/TableFilters";
import { DataTable } from "@/components/shared/DataTable/DataTable";
import { FilterDateRange } from "@/components/shared/DataTable/components/FilterDateRange";
import { useTableState } from "@/components/shared/DataTable/useTableState";
import {
  AsyncDropdown,
  AsyncDropdownOption,
} from "@/components/shared/Interactives/AsyncDropdown";
import { useGetLocationSimple } from "@/features/locations/hooks/useLocation";
import { OrderSuccessModal } from "@/features/pos/components/reviewAndPayment/OrderSuccessModal";
import { MANAGER_SALES_COLUMNS, SALES_TABLE_CONFIG } from "./SaleColumns";
import { MANAGER_SALES_DROPDOWNS } from "../config/sales.table";

export function ManagerSales() {
  const {
    page,
    sortKey,
    sortDir,
    filters,
    handleSort,
    handleApply: applyFilters,
    handlePageChange,
  } = useTableState({
    defaultSortKey: SALES_TABLE_CONFIG.defaultSorting.columnKey,
    defaultSortDir: SALES_TABLE_CONFIG.defaultSorting.direction,
  });

  const { data: locations, status: locationsStatus } = useGetLocationSimple();

  const [locationId, setLocationId] = useState(filters.locationId ?? "");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: sale } = useGetSaleById(selectedId);

  const {
    data,
    meta,
    status: queryStatus,
    refetch,
  } = useManagerSalesPage({
    page,
    search: filters.search ?? "",
    status: filters.status ?? "",
    paymentMethod: filters.paymentMethod ?? "",
    locationId: filters.locationId ?? "",
    dateFrom: filters.dateFrom ?? "",
    dateTo: filters.dateTo ?? "",
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

  function handleApply(newFilters: Record<string, string>) {
    applyFilters(newFilters, refetch);
  }

  const openModalForId = (id: string) => {
    setSelectedId(id);
    setOpenModal(true);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-2xl">
      <PageHeader
        title="Ventas"
        subtitle="Vista global de ventas de todas las sucursales"
      />

      <TableFilters
        searchPlaceholder="Buscar por cliente..."
        onApply={handleApply}
        dropdowns={MANAGER_SALES_DROPDOWNS}
        initialValues={filters}
        extraValues={{ locationId, dateFrom, dateTo }}
        onClearExtra={() => {
          setLocationId("");
          setDateFrom("");
          setDateTo("");
        }}
        isLoading={queryStatus === "pending"}
      >
        <AsyncDropdown
          placeholder="Sucursal"
          value={locationId ?? filters.locationId ?? ""}
          onChange={(id) => setLocationId(id)}
          options={locationOptions}
          isLoading={locationsStatus === "pending"}
          emptyText="Sin sucursales"
        />
        <FilterDateRange
          fromValue={dateFrom}
          toValue={dateTo}
          onFromChange={setDateFrom}
          onToChange={setDateTo}
          max={new Date().toISOString().split("T")[0]}
        />
      </TableFilters>

      <DataTable
        columns={MANAGER_SALES_COLUMNS}
        data={data}
        meta={meta}
        isLoading={queryStatus === "pending"}
        onPageChange={handlePageChange}
        onSort={handleSort}
        sortKey={sortKey}
        sortDir={sortDir}
        onRowClick={(data) => openModalForId(data.id)}
        rowKey={(row) => row.id}
        emptyMessage="No hay ventas"
        emptySubMessage="Intenta cambiar los filtros"
      />

      {openModal && sale && (
        <OrderSuccessModal
          sale={sale}
          customerName={sale.customerName}
          onEmitInvoice={() => console.log("Emitir factura")}
          showDetails
          onClose={() => {
            setOpenModal(false);
            setSelectedId(null);
          }}
        />
      )}
    </div>
  );
}
