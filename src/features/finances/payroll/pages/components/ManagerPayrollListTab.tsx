import { useState } from "react";
import { TableFilters } from "@/components/shared/DataTable/TableFilters";
import { DataTable } from "@/components/shared/DataTable/DataTable";
import { FilterDateRange } from "@/components/shared/DataTable/components/FilterDateRange";
import { useTableState } from "@/components/shared/DataTable/useTableState";
import {
  AsyncDropdown,
  AsyncDropdownOption,
} from "@/components/shared/Interactives/AsyncDropdown";
import { useGetLocationSimple } from "@/features/locations/hooks/useLocation";
import { usePayrollPage } from "../../hooks/usePayroll";
import { PAYROLL_COLUMNS } from "../PayrollColumns";
import { PayrollDetailModal } from "./PayrollDetailModal";

export function ManagerPayrollListTab() {
  const {
    page,
    filters,
    handleApply: applyFilters,
    handlePageChange,
  } = useTableState();

  const { data: locations, status: locationsStatus } = useGetLocationSimple();

  const [locationId, setLocationId] = useState(filters.locationId ?? "");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeLocationId = filters.locationId ?? "";

  const {
    data,
    meta,
    status: queryStatus,
    refetch,
  } = usePayrollPage({
    locationId: activeLocationId,
    page,
    dateFrom: filters.dateFrom ?? "",
    dateTo: filters.dateTo ?? "",
    search: filters.search ?? "",
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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TableFilters
        searchPlaceholder="Buscar por empleado o cargo..."
        onApply={handleApply}
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

      {!activeLocationId ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[13px] text-inkblack/40">
            Selecciona una sucursal para ver su nómina.
          </p>
        </div>
      ) : (
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
      )}

      {selectedId && (
        <PayrollDetailModal
          payrollId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
