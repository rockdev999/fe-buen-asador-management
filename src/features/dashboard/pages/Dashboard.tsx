import { useState } from "react";
import { Receipt, Scale, TrendingUp, Wallet } from "lucide-react";
import { PageHeader } from "@/components/shared/DataTable/PageHeader";
import {
  AsyncDropdown,
  AsyncDropdownOption,
} from "@/components/shared/Interactives/AsyncDropdown";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useGetLocationSimple } from "@/features/locations/hooks/useLocation";
import {
  ReportError,
  ReportLoading,
  StatCard,
} from "@/features/finances/reports/pages/components/ReportBlocks";
import { formatReportDate } from "@/features/finances/reports/utils/report-period";
import { cn, formatMoney } from "@/lib/utils";
import { useDashboard } from "../hooks/useDashboard";
import {
  AlertsCard,
  Last7DaysChart,
  LocationsTodayTable,
  OrdersCard,
  ShiftsCard,
} from "./components/DashboardCards";

const ALL_LOCATIONS_LABEL = "Todas las sucursales";

const DASHBOARD_ERROR_MESSAGES: Record<number, string> = {
  404: "La sucursal seleccionada no existe.",
  403: "No tienes permiso para ver el dashboard.",
};

export function Dashboard() {
  const { isManager } = useAuth();
  const [locationId, setLocationId] = useState("");

  // El selector es solo del MANAGER; para ADMIN el backend usa su sucursal.
  const { data: report, status, error } = useDashboard(
    isManager && locationId ? locationId : null,
  );

  const subtitle = report
    ? `Hoy, ${formatReportDate(report.date)} · ${report.location?.name ?? ALL_LOCATIONS_LABEL}`
    : "Resumen del día";

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-2xl">
      <PageHeader
        title="Dashboard"
        subtitle={subtitle}
        actions={
          isManager && (
            <ManagerLocationSelect value={locationId} onChange={setLocationId} />
          )
        }
      />

      <div className="flex-1 overflow-y-auto p-4">
        {status === "pending" && !report ? (
          <ReportLoading />
        ) : status === "error" && !report ? (
          <ReportError error={error} messages={DASHBOARD_ERROR_MESSAGES} />
        ) : report ? (
          <div className="flex flex-col gap-4">
            {report.today.salesCount === 0 && (
              <div className="rounded-2xl border border-dashed border-surface bg-white px-4 py-3 text-[13px] text-muted-foreground">
                Aún no hay ventas hoy
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <StatCard
                label="Ventas de hoy"
                value={formatMoney(report.today.totalSales)}
                hint={`${report.today.salesCount} ${report.today.salesCount === 1 ? "venta" : "ventas"}`}
                icon={Receipt}
              />
              <StatCard
                label="Ticket promedio"
                value={formatMoney(report.today.averageTicket)}
                icon={TrendingUp}
              />
              <StatCard
                label="Egresos de hoy"
                value={formatMoney(report.today.totalExpenses)}
                hint="incluye nómina"
                icon={Wallet}
              />
              <StatCard
                label="Balance de hoy"
                value={
                  <span
                    className={cn(report.today.balance < 0 && "text-red-500")}
                  >
                    {formatMoney(report.today.balance)}
                  </span>
                }
                icon={Scale}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <ShiftsCard
                shifts={report.shifts}
                isSingleLocation={report.location !== null}
              />
              <OrdersCard orders={report.orders} />
              <AlertsCard alerts={report.alerts} />
            </div>

            <Last7DaysChart days={report.last7Days} today={report.date} />

            {report.byLocation !== null && (
              <LocationsTodayTable rows={report.byLocation} />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ManagerLocationSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const { data: locations, status } = useGetLocationSimple();

  const options: AsyncDropdownOption<{ id: string; name: string }>[] = (
    locations ?? []
  ).map((loc) => ({
    id: loc.id,
    data: loc,
    searchText: loc.name,
    render: (item) => <span>{item.name}</span>,
  }));

  return (
    <AsyncDropdown
      placeholder={ALL_LOCATIONS_LABEL}
      clearLabel={ALL_LOCATIONS_LABEL}
      value={value}
      onChange={(id) => onChange(id)}
      options={options}
      isLoading={status === "pending"}
      emptyText="Sin sucursales"
      searchable
    />
  );
}
