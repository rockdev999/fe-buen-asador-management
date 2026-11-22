import { useMemo } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { PageHeader } from "@/components/shared/DataTable/PageHeader";
import {
  AsyncDropdown,
  AsyncDropdownOption,
} from "@/components/shared/Interactives/AsyncDropdown";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useGetLocationSimple } from "@/features/locations/hooks/useLocation";
import { cn } from "@/lib/utils";
import { ReportParams } from "../dto/report.dto";
import { SUMMARY_PDF_ROLES, tabsForRole } from "../config/report-tabs";
import { useReportFilters } from "../hooks/useReportFilters";
import { useReportPdfDownload } from "../hooks/useReports";
import {
  comparisonLabel,
  formatReportDate,
  periodLabel,
  previousRange,
} from "../utils/report-period";
import { ReportPeriodPicker } from "./components/ReportPeriodPicker";
import { ExportMenu } from "./components/ExportMenu";
import { ReportTabProps } from "./components/ReportBlocks";
import { SalesReportTab } from "./components/SalesReportTab";
import { ExpensesReportTab } from "./components/ExpensesReportTab";
import { PayrollReportTab } from "./components/PayrollReportTab";
import { IngredientsReportTab } from "./components/IngredientsReportTab";

const ALL_LOCATIONS_LABEL = "Todas las sucursales";

const TAB_DESCRIPTIONS = {
  sales: "Cuánto se vendió, cómo pagaron y qué productos se venden más.",
  expenses: "En qué se gastó el dinero, por categoría.",
  payroll: "Cuánto se pagó a cada empleado.",
  ingredients: "Compras, consumo y merma de cada insumo.",
} as const;

const formatRange = (from: string, to: string) =>
  from === to ? formatReportDate(from) : `${formatReportDate(from)} – ${formatReportDate(to)}`;

export function Reports() {
  const { user, isManager, hasRole } = useAuth();
  const { filters, setTab, setMode, setRange, setLocationId } = useReportFilters();
  const { download, pending } = useReportPdfDownload();

  const tabs = tabsForRole(hasRole);
  const activeTab = tabs.find((t) => t.key === filters.tab) ?? tabs[0];

  const { data: locations, status: locationsStatus } = useGetLocationSimple();

  // El admin siempre ve su sucursal: el backend ignora locationId.
  const locationId = isManager ? filters.locationId : "";
  const rangeValid = filters.rangeError === null;

  const tabProps = useMemo<ReportTabProps>(() => {
    const loc = locationId ? { locationId } : {};
    const params: ReportParams = { ...filters.range, ...loc };
    const prev = rangeValid ? previousRange(filters.mode, filters.range) : null;
    return {
      params,
      previous: prev && { ...prev, ...loc },
      compareLabel: comparisonLabel(filters.mode),
    };
  }, [filters.range, filters.mode, locationId, rangeValid]);

  const scopeLabel = isManager
    ? locationId
      ? (locations?.find((l) => l.id === locationId)?.name ?? "Sucursal")
      : ALL_LOCATIONS_LABEL
    : (user?.locationName ?? "Tu sucursal");

  const locationOptions: AsyncDropdownOption<{ id: string; name: string }>[] =
    (locations ?? []).map((loc) => ({
      id: loc.id,
      data: loc,
      searchText: loc.name,
      render: (item) => <span>{item.name}</span>,
    }));

  if (!activeTab) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-2xl">
      <PageHeader
        title="Reportes"
        subtitle="Revisa cómo va el negocio y descarga los reportes en PDF"
      />

      {/* Filtros (aplican a todas las pestañas) + exportar */}
      <div className="flex items-start gap-3 px-4 py-3 border-b border-surface bg-white flex-shrink-0 flex-wrap">
        <ReportPeriodPicker
          mode={filters.mode}
          range={filters.range}
          error={filters.rangeError}
          onModeChange={setMode}
          onRangeChange={setRange}
        />

        {isManager && (
          <div className="w-[220px]">
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
        )}

        <div className="ml-auto">
          <ExportMenu
            activeTab={activeTab}
            canSummary={hasRole(...SUMMARY_PDF_ROLES)}
            disabledReason={filters.rangeError}
            pending={pending}
            onDownload={(type, detail) =>
              download(type, {
                ...tabProps.params,
                ...(detail !== undefined && { detail }),
              })
            }
          />
        </div>
      </div>

      {/* Pestañas: solo las que el rol puede ver */}
      <div
        role="tablist"
        aria-label="Reporte"
        className="flex items-center gap-1 px-4 border-b border-surface bg-white flex-shrink-0 overflow-x-auto"
      >
        {tabs.map((tab) => {
          const active = activeTab.key === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(tab.key)}
              className={cn(
                "relative flex items-center gap-1.5 h-11 px-3 text-[13px] font-medium whitespace-nowrap transition-colors",
                active ? "text-brand" : "text-inkblack/50 hover:text-inkblack",
              )}
            >
              <tab.icon size={14} />
              {tab.label}
              <span
                className={cn(
                  "absolute inset-x-2 -bottom-px h-0.5 rounded-full transition-colors",
                  active ? "bg-brand" : "bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto bg-surface/30">
        <div className="mx-auto max-w-[1400px] p-4 flex flex-col gap-4">
          {/* Qué se está viendo */}
          <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
            <div>
              <h2 className="text-base font-semibold text-inkblack">{activeTab.label}</h2>
              <p className="text-[12px] text-muted-foreground">
                {TAB_DESCRIPTIONS[activeTab.key]}
              </p>
            </div>
            {rangeValid && (
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-inkblack/70">
                <span className="flex items-center gap-1">
                  <CalendarDays size={12} className="text-muted-foreground" />
                  <span className="font-medium">{periodLabel(filters.mode)}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatRange(filters.range.dateFrom, filters.range.dateTo)}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-muted-foreground" />
                  <span className="font-medium">{scopeLabel}</span>
                </span>
              </p>
            )}
          </div>

          {!rangeValid ? (
            <div className="rounded-2xl border border-dashed border-inkblack/10 bg-white py-14 text-center">
              <p className="text-[13px] font-medium text-inkblack/60">Elige un periodo válido</p>
              <p className="mt-1 text-[12px] text-muted-foreground">{filters.rangeError}</p>
            </div>
          ) : (
            <>
              {/* Solo se consulta el endpoint de la pestaña activa */}
              {activeTab.key === "sales" && <SalesReportTab {...tabProps} />}
              {activeTab.key === "expenses" && <ExpensesReportTab {...tabProps} />}
              {activeTab.key === "payroll" && <PayrollReportTab {...tabProps} />}
              {activeTab.key === "ingredients" && <IngredientsReportTab {...tabProps} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
