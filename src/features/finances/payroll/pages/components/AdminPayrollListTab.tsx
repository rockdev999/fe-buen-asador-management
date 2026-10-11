import { useState } from "react";
import { TableFilters } from "@/components/shared/DataTable/TableFilters";
import { DataTable } from "@/components/shared/DataTable/DataTable";
import { FilterDateRange } from "@/components/shared/DataTable/components/FilterDateRange";
import { useTableState } from "@/components/shared/DataTable/useTableState";
import { usePayrollPage } from "../../hooks/usePayroll";
import { PAYROLL_COLUMNS } from "../PayrollColumns";
import { PayrollDetailModal } from "./PayrollDetailModal";

// El backend ignora cualquier locationId para ADMIN/CASHIER y siempre
// devuelve los pagos de su propia sucursal, así que no hace falta pasarlo.
export function AdminPayrollListTab() {
  const { page, filters, handleApply: applyFilters, handlePageChange } =
    useTableState();

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    data,
    meta,
    status: queryStatus,
    refetch,
  } = usePayrollPage({
    page,
    dateFrom: filters.dateFrom ?? "",
    dateTo: filters.dateTo ?? "",
    search: filters.search ?? "",
  });

  function handleApply(newFilters: Record<string, string>) {
    applyFilters(newFilters, refetch);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TableFilters
        searchPlaceholder="Buscar por empleado o cargo..."
        onApply={handleApply}
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
        columns={PAYROLL_COLUMNS}
        data={data}
        meta={meta}
        isLoading={queryStatus === "pending"}
        onPageChange={handlePageChange}
        onRowClick={(row) => setSelectedId(row.id)}
        rowKey={(row) => row.id}
        emptyMessage="No hay pagos de nómina"
        emptySubMessage="Intenta cambiar los filtros"
      />

      {selectedId && (
        <PayrollDetailModal
          payrollId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
