import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Lock,
  LockOpen,
} from "lucide-react";
import { PATHS } from "@/routes/paths";
import { formatLocalTime } from "@/lib/formatters";
import { cn, formatMoney } from "@/lib/utils";
import { ReportSection } from "@/features/finances/reports/pages/components/ReportBlocks";
import {
  formatReportDate,
  formatReportDayShort,
} from "@/features/finances/reports/utils/report-period";
import { DashboardDTO } from "../../dto/dashboard.dto";

// ─── Chip ────────────────────────────────────────────────────────────────────

type ChipTone = "neutral" | "success" | "warning" | "info" | "danger";

const CHIP_TONES: Record<ChipTone, string> = {
  neutral: "bg-surface text-muted-foreground",
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  info: "bg-sky-50 text-sky-600",
  danger: "bg-red-50 text-red-600",
};

function Chip({
  tone = "neutral",
  children,
}: {
  tone?: ChipTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium",
        CHIP_TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

// ─── Caja ────────────────────────────────────────────────────────────────────

export function ShiftsCard({
  shifts,
  isSingleLocation,
}: {
  shifts: DashboardDTO["shifts"];
  isSingleLocation: boolean;
}) {
  const openCount = shifts.filter((s) => s.isOpen).length;
  const single = shifts[0];

  return (
    <ReportSection title="Caja">
      {isSingleLocation ? (
        !single ? (
          <p className="text-[13px] text-muted-foreground">Sin caja registrada</p>
        ) : single.isOpen ? (
          <div className="flex items-start gap-2">
            <LockOpen size={16} className="mt-0.5 shrink-0 text-emerald-600" />
            <p className="text-[13px] text-inkblack">
              <span className="font-semibold text-emerald-600">Abierta</span>
              {single.cashier && <> · {single.cashier.name}</>}
              {single.openedAt && (
                <span className="text-muted-foreground">
                  {" "}
                  desde las {formatLocalTime(single.openedAt)}
                </span>
              )}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Lock size={16} className="shrink-0 text-muted-foreground" />
            <p className="text-[13px] font-semibold text-muted-foreground">
              Cerrada
            </p>
          </div>
        )
      ) : (
        <>
          <p className="text-lg font-semibold text-inkblack tabular-nums">
            {openCount}{" "}
            <span className="text-[13px] font-normal text-muted-foreground">
              de {shifts.length} abiertas
            </span>
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {shifts.map((s) => (
              <Chip key={s.location.id} tone={s.isOpen ? "success" : "neutral"}>
                {s.isOpen ? <LockOpen size={10} /> : <Lock size={10} />}
                {s.location.name}
              </Chip>
            ))}
          </div>
        </>
      )}
    </ReportSection>
  );
}

// ─── Pedidos en curso ────────────────────────────────────────────────────────

export function OrdersCard({ orders }: { orders: DashboardDTO["orders"] }) {
  return (
    <ReportSection title="Pedidos en curso">
      <div className="flex items-center gap-2">
        <ClipboardList size={16} className="shrink-0 text-brand" />
        <p className="text-lg font-semibold text-inkblack tabular-nums">
          {orders.total}
        </p>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Chip tone="warning">
          {plural(orders.pending, "pendiente", "pendientes")}
        </Chip>
        <Chip tone="info">{orders.preparing} en preparación</Chip>
        <Chip tone="success">{plural(orders.ready, "listo", "listos")}</Chip>
      </div>
    </ReportSection>
  );
}

// ─── Alertas de stock ────────────────────────────────────────────────────────

export function AlertsCard({ alerts }: { alerts: DashboardDTO["alerts"] }) {
  return (
    <ReportSection title="Alertas de stock">
      {alerts.total > 0 ? (
        <>
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0 text-amber-500" />
            <p className="text-lg font-semibold text-inkblack tabular-nums">
              {alerts.total}
            </p>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Chip tone="danger">
              {plural(alerts.products, "producto", "productos")}
            </Chip>
            <Chip tone="danger">
              {plural(alerts.ingredients, "insumo", "insumos")}
            </Chip>
          </div>
          <Link
            to={PATHS.INVENTORY}
            className="mt-3 inline-block text-[12px] font-medium text-brand hover:underline"
          >
            Ver inventario →
          </Link>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
          <p className="text-[13px] font-semibold text-emerald-600">
            Todo en orden
          </p>
        </div>
      )}
    </ReportSection>
  );
}

// ─── Ventas de los últimos 7 días ────────────────────────────────────────────

export function Last7DaysChart({
  days,
  today,
}: {
  days: DashboardDTO["last7Days"];
  today: string;
}) {
  const max = Math.max(...days.map((d) => d.total), 1);

  return (
    <ReportSection title="Ventas de los últimos 7 días">
      <div className="flex items-end gap-2 h-44">
        {days.map((day) => {
          const isToday = day.date === today;
          return (
            <div
              key={day.date}
              className="group relative flex-1 h-full flex flex-col justify-end items-center min-w-0"
            >
              <span
                className={cn(
                  "mb-1 text-[10px] tabular-nums truncate max-w-full",
                  isToday ? "font-semibold text-brand" : "text-muted-foreground",
                )}
              >
                {day.total > 0 ? formatMoney(day.total) : ""}
              </span>
              <div
                className={cn(
                  "w-full rounded-t-lg transition-all duration-300",
                  day.total <= 0
                    ? "bg-surface"
                    : isToday
                      ? "bg-brand"
                      : "bg-brand/30 group-hover:bg-brand/50",
                )}
                style={{
                  height:
                    day.total > 0 ? `${(day.total / max) * 80}%` : "2px",
                }}
                title={`${formatReportDate(day.date)}: ${formatMoney(day.total)} · ${plural(day.salesCount, "venta", "ventas")}`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 mt-1.5">
        {days.map((day) => {
          const isToday = day.date === today;
          return (
            <span
              key={day.date}
              className={cn(
                "flex-1 min-w-0 text-center text-[10px] tabular-nums",
                isToday ? "font-semibold text-brand" : "text-muted-foreground",
              )}
            >
              {isToday ? "Hoy" : formatReportDayShort(day.date)}
            </span>
          );
        })}
      </div>
    </ReportSection>
  );
}

// ─── Sucursales hoy ──────────────────────────────────────────────────────────

export function LocationsTodayTable({
  rows,
}: {
  rows: NonNullable<DashboardDTO["byLocation"]>;
}) {
  return (
    <ReportSection title="Sucursales hoy">
      <div className="overflow-x-auto -mx-4">
        <table className="w-full min-w-[520px] text-[12px]">
          <thead>
            <tr className="border-b border-surface text-left text-[10px] uppercase tracking-widest text-muted-foreground">
              <th className="px-4 py-2 font-semibold">Sucursal</th>
              <th className="px-4 py-2 font-semibold text-right">
                Ventas de hoy
              </th>
              <th className="px-4 py-2 font-semibold text-right">Cantidad</th>
              <th className="px-4 py-2 font-semibold">Caja</th>
              <th className="px-4 py-2 font-semibold text-right">Alertas</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.location.id}
                className="border-b border-surface last:border-0"
              >
                <td className="px-4 py-2.5 font-medium text-inkblack">
                  {row.location.name}
                </td>
                <td className="px-4 py-2.5 text-right font-medium text-inkblack tabular-nums">
                  {formatMoney(row.totalSales)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {row.salesCount}
                </td>
                <td className="px-4 py-2.5">
                  <Chip tone={row.shiftOpen ? "success" : "neutral"}>
                    {row.shiftOpen ? "Abierta" : "Cerrada"}
                  </Chip>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {row.alerts > 0 ? (
                    <Chip tone="danger">{row.alerts}</Chip>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ReportSection>
  );
}
