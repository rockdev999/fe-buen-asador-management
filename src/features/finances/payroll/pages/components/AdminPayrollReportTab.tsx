import { getTodayLocalDateInput } from "@/lib/formatters";
import { useState } from "react";
import { FilterDateRange } from "@/components/shared/DataTable/components/FilterDateRange";
import { Button } from "@/components/shared/Basics/Button";
import { usePayrollReport } from "../../hooks/usePayroll";
import { PayrollReportView } from "./PayrollReportView";

export function AdminPayrollReportTab() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [appliedRange, setAppliedRange] = useState<{
    dateFrom: string;
    dateTo: string;
  } | null>(null);

  const { data: report, status: reportStatus } = usePayrollReport({
    dateFrom: appliedRange?.dateFrom ?? "",
    dateTo: appliedRange?.dateTo ?? "",
  });

  const canGenerate = !!dateFrom && !!dateTo;

  function handleGenerate() {
    if (!canGenerate) return;
    setAppliedRange({ dateFrom, dateTo });
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-surface bg-white flex-shrink-0 flex-wrap">
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
        emptyMessage="Selecciona un rango de fechas para generar el reporte de nómina."
      />
    </div>
  );
}
