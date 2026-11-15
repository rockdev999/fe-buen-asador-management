import { useMemo, useState } from "react";
import { CalendarDays, ChefHat, Receipt, Wallet } from "lucide-react";
import { PageHeader } from "@/components/shared/DataTable/PageHeader";
import {
  AsyncDropdown,
  AsyncDropdownOption,
} from "@/components/shared/Interactives/AsyncDropdown";
import { useGetLocationSimple } from "@/features/locations/hooks/useLocation";
import { cn } from "@/lib/utils";
import { ReportParams } from "../dto/report.dto";
import {
  DEFAULT_REPORT_PERIOD,
  formatReportDate,
  getReportPeriodRange,
  REPORT_PERIOD_OPTIONS,
  ReportPeriod,
} from "../utils/report-period";
import { SalesReportTab } from "./components/SalesReportTab";
import { ExpensesPayrollReportTab } from "./components/ExpensesPayrollReportTab";
import { IngredientsReportTab } from "./components/IngredientsReportTab";

type ReportsTab = "sales" | "expenses" | "ingredients";

const TABS: { key: ReportsTab; label: string; icon: React.ElementType }[] = [
  { key: "sales", label: "Ventas", icon: Receipt },
  { key: "expenses", label: "Egresos y nómina", icon: Wallet },
  { key: "ingredients", label: "Insumos", icon: ChefHat },
];

const ALL_LOCATIONS_LABEL = "Todas las sucursales";

export function Reports() {
  const [activeTab, setActiveTab] = useState<ReportsTab>("sales");
  const [period, setPeriod] = useState<ReportPeriod>(DEFAULT_REPORT_PERIOD);
  const [locationId, setLocationId] = useState("");

  const { data: locations, status: locationsStatus } = useGetLocationSimple();

  const params = useMemo<ReportParams>(
    () => ({
      ...getReportPeriodRange(period),
      ...(locationId && { locationId }),
    }),
    [period, locationId],
  );

  const locationOptions: AsyncDropdownOption<{ id: string; name: string }>[] =
    (locations ?? []).map((loc) => ({
      id: loc.id,
      data: loc,
      searchText: loc.name,
      render: (item) => <span>{item.name}</span>,
    }));

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-2xl">
      <PageHeader
        title="Reportes"
        subtitle="Ventas, egresos, nómina e insumos por período y sucursal"
      />

      {/* Filtros */}
      <div className="flex items-start gap-3 px-4 py-2.5 border-b border-surface bg-white flex-shrink-0 flex-wrap">
        <div className="flex flex-col gap-1">
          <div
            role="radiogroup"
            aria-label="Período"
            className="flex items-center gap-1 rounded-xl bg-surface/60 p-1"
          >
            {REPORT_PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={period === option.value}
                onClick={() => setPeriod(option.value)}
                className={cn(
                  "h-7 px-3 rounded-lg text-[12px] font-medium transition-all",
                  period === option.value
                    ? "bg-white text-brand shadow-sm"
                    : "text-muted-foreground hover:text-inkblack",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <span className="flex items-center gap-1 pl-1 text-[11px] text-muted-foreground tabular-nums">
            <CalendarDays size={11} />
            {formatReportDate(params.dateFrom)} –{" "}
            {formatReportDate(params.dateTo)}
          </span>
        </div>

        <AsyncDropdown
          placeholder={ALL_LOCATIONS_LABEL}
          clearLabel={ALL_LOCATIONS_LABEL}
          value={locationId}
          onChange={(id) => setLocationId(id)}
          options={locationOptions}
          isLoading={locationsStatus === "pending"}
          emptyText="Sin sucursales"
          searchable
        />
      </div>

      {/* Pestañas */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-surface bg-white flex-shrink-0 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-1.5 h-8 px-3 rounded-xl text-[12px] font-medium transition-all whitespace-nowrap",
              activeTab === tab.key
                ? "bg-brand/8 text-brand"
                : "text-muted-foreground hover:bg-surface hover:text-inkblack",
            )}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cada pestaña consulta solo su endpoint */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "sales" && <SalesReportTab params={params} />}
        {activeTab === "expenses" && (
          <ExpensesPayrollReportTab params={params} />
        )}
        {activeTab === "ingredients" && <IngredientsReportTab params={params} />}
      </div>
    </div>
  );
}
