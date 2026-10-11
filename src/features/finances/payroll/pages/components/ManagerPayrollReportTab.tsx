import { getTodayLocalDateInput } from "@/lib/formatters";
import { useState } from "react";
import { FilterDateRange } from "@/components/shared/DataTable/components/FilterDateRange";
import {
  AsyncDropdown,
  AsyncDropdownOption,
} from "@/components/shared/Interactives/AsyncDropdown";
import { Button } from "@/components/shared/Basics/Button";
import { useGetLocationSimple } from "@/features/locations/hooks/useLocation";
import { usePayrollReport } from "../../hooks/usePayroll";
import { PayrollReportView } from "./PayrollReportView";

export function ManagerPayrollReportTab() {
  const { data: locations, status: locationsStatus } = useGetLocationSimple();

  const [locationId, setLocationId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [appliedFilters, setAppliedFilters] = useState<{
    locationId: string;
    dateFrom: string;
    dateTo: string;
  } | null>(null);

  const { data: report, status: reportStatus } = usePayrollReport({
    locationId: appliedFilters?.locationId || undefined,
    dateFrom: appliedFilters?.dateFrom ?? "",
    dateTo: appliedFilters?.dateTo ?? "",
  });

  const locationOptions: AsyncDropdownOption<{ id: string; name: string }>[] =
    (locations ?? []).map((loc) => ({
      id: loc.id,
      data: loc,
      searchText: loc.name,
      render: (item) => <span>{item.name}</span>,
    }));

  const canGenerate = !!dateFrom && !!dateTo;

  function handleGenerate() {
    if (!canGenerate) return;
    setAppliedFilters({ locationId, dateFrom, dateTo });
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-surface bg-white flex-shrink-0 flex-wrap">
        <AsyncDropdown
          placeholder="Todas las sucursales"
          clearLabel="Todas las sucursales"
          value={locationId}
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
          max={getTodayLocalDateInput()}
        />
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          isLoading={reportStatus === "pending"}
        >
          Generar reporte
        </Button>
      </div>

      <PayrollReportView
        report={report}
        isLoading={reportStatus === "pending"}
        emptyMessage="Selecciona un rango de fechas para generar el reporte de nómina. Si no eliges sucursal, verás el total de todas."
      />
    </div>
  );
}
