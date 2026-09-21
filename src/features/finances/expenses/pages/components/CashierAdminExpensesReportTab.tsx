import { useState } from "react";
import { FilterDateRange } from "@/components/shared/DataTable/components/FilterDateRange";
import { Button } from "@/components/shared/Basics/Button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useExpensesReport } from "../../hooks/useExpenses";
import { ExpenseReportView } from "./ExpenseReportView";

export function CashierAdminExpensesReportTab() {
  const { user } = useAuth();
  const locationId = user?.locationId ?? "";

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [appliedRange, setAppliedRange] = useState<{
    dateFrom: string;
    dateTo: string;
  } | null>(null);

  const { data: report, status: reportStatus } = useExpensesReport({
    locationId,
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
          max={new Date().toISOString().split("T")[0]}
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

      <ExpenseReportView
        report={report}
        isLoading={reportStatus === "pending"}
        emptyMessage="Selecciona un rango de fechas para generar el reporte de egresos."
      />
    </div>
  );
}
