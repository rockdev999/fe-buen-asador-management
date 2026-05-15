import { useState } from "react";
import { useGetSaleById, useSalesPage } from "../hooks/useSale";
import { PageHeader } from "@/components/shared/DataTable/PageHeader";
import { TableFilters } from "@/components/shared/DataTable/TableFilters";
import { SALES_DROPDOWNS } from "../config/sales.table";
import { DataTable } from "@/components/shared/DataTable/DataTable";
import { SALES_COLUMNS, SALES_TABLE_CONFIG } from "./SaleColumns";
import { FilterDateRange } from "@/components/shared/DataTable/components/FilterDateRange";
import { useTableState } from "@/components/shared/DataTable/useTableState";
import { OrderSuccessModal } from "@/features/pos/components/reviewAndPayment/OrderSuccessModal";

export function Sales() {
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
  } = useSalesPage({
    page,
    search: filters.search ?? "",
    status: filters.status ?? "",
    dateFrom: filters.dateFrom ?? "",
    dateTo: filters.dateTo ?? "",
    sortKey,
    sortDir,
  });

  function handleApply(newFilters: Record<string, string>) {
    applyFilters(newFilters, refetch);
  }

  const openModalForId = (id: string) => {
    setSelectedId(id);
    setOpenModal(true);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-2xl">
      <PageHeader title="Pedidos" />

      <TableFilters
        searchPlaceholder="Buscar por cliente..."
        onApply={handleApply}
        dropdowns={SALES_DROPDOWNS}
        initialValues={filters}
        extraValues={{ dateFrom, dateTo }}
        onClearExtra={() => {
          setDateFrom("");
          setDateTo("");
        }}
        isLoading={queryStatus === "pending"}
      >
        <FilterDateRange
          fromValue={dateFrom}
          toValue={dateTo}
          onFromChange={setDateFrom}
          onToChange={setDateTo}
          max={new Date().toISOString().split("T")[0]}
        />
      </TableFilters>

      <DataTable
        columns={SALES_COLUMNS}
        data={data}
        meta={meta}
        isLoading={queryStatus === "pending"}
        onPageChange={handlePageChange}
        onSort={handleSort}
        sortKey={sortKey}
        sortDir={sortDir}
        onRowClick={(data) => {
          openModalForId(data.id);
        }}
        rowKey={(row) => row.id}
        emptyMessage="No hay pedidos"
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
