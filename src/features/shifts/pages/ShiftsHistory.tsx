import { useState } from "react";
import { PageHeader } from "@/components/shared/DataTable/PageHeader";
import {
  FilterDropdown,
  TableFilters,
} from "@/components/shared/DataTable/TableFilters";
import { DataTable } from "@/components/shared/DataTable/DataTable";
import { FilterDateRange } from "@/components/shared/DataTable/components/FilterDateRange";
import { useTableState } from "@/components/shared/DataTable/useTableState";
import {
  AsyncDropdown,
  AsyncDropdownOption,
} from "@/components/shared/Interactives/AsyncDropdown";
import { ShiftStatusEnum } from "@/constants";
import { getTodayLocalDateInput } from "@/lib/formatters";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useGetLocationSimple } from "@/features/locations/hooks/useLocation";
import { useShiftsPage } from "@/features/pos/hooks/useShift";
import { SHIFT_STATUS_OPTIONS } from "@/utils/generalStatus/shift-display";
import { getShiftColumns } from "./ShiftColumns";
import { ShiftDetailModal } from "./components/ShiftDetailModal";

const STATUS_DROPDOWN: FilterDropdown = {
  key: "status",
  placeholder: "Estado",
  options: SHIFT_STATUS_OPTIONS,
};

/**
 * Turnos de caja para ADMIN (su sucursal; bandeja de aprobación) y MANAGER
 * (todas las sucursales, solo lectura).
 */
export function ShiftsHistory() {
  const { isAdmin, isManager, user } = useAuth();

  // El ADMIN entra directo a su bandeja de cierres pendientes.
  const initialFilters: Record<string, string> = isAdmin
    ? { status: ShiftStatusEnum.PENDING }
    : {};

  const { page, filters, handleApply: applyFilters, handlePageChange } =
    useTableState();
  const activeFilters = Object.keys(filters).length ? filters : initialFilters;

  const { data: locations, status: locationsStatus } = useGetLocationSimple();

  const [locationId, setLocationId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    data,
    meta,
    status: queryStatus,
    refetch,
  } = useShiftsPage({
    page,
    status: activeFilters.status ?? "",
    locationId: isManager ? (activeFilters.locationId ?? "") : "",
    dateFrom: activeFilters.dateFrom ?? "",
    dateTo: activeFilters.dateTo ?? "",
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
    <div className="flex flex-col h-full overflow-hidden rounded-2xl">
      <PageHeader
        title="Turnos de caja"
        subtitle={
          isAdmin
            ? `Cierres de ${user?.locationName ?? "tu sucursal"}`
            : "Cierres de todas las sucursales"
        }
      />

      <TableFilters
        showSearch={false}
        onApply={handleApply}
        dropdowns={[STATUS_DROPDOWN]}
        initialValues={activeFilters}
        extraValues={{
          ...(isManager && { locationId }),
          dateFrom,
          dateTo,
        }}
        onClearExtra={() => {
          setLocationId("");
          setDateFrom("");
          setDateTo("");
        }}
        isLoading={queryStatus === "pending"}
      >
        {isManager && (
          <AsyncDropdown
            placeholder="Todas las sucursales"
            clearLabel="Todas las sucursales"
            value={locationId}
            onChange={(id) => setLocationId(id)}
            options={locationOptions}
            isLoading={locationsStatus === "pending"}
            emptyText="Sin sucursales"
          />
        )}
        <FilterDateRange
          fromValue={dateFrom}
          toValue={dateTo}
          onFromChange={setDateFrom}
          onToChange={setDateTo}
          max={getTodayLocalDateInput()}
        />
      </TableFilters>

      <DataTable
        columns={getShiftColumns(isManager)}
        data={data}
        meta={meta}
        isLoading={queryStatus === "pending"}
        onPageChange={handlePageChange}
        onRowClick={(row) => setSelectedId(row.id)}
        rowKey={(row) => row.id}
        emptyMessage="No hay turnos"
        emptySubMessage="Intenta cambiar los filtros"
      />

      {selectedId && (
        <ShiftDetailModal
          shiftId={selectedId}
          canApprove={isAdmin}
          onClose={() => setSelectedId(null)}
          onApproved={() => {
            setSelectedId(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
