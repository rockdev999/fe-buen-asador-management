import { Receipt, TrendingUp, Wallet } from "lucide-react";
import { PaymentMethodEnum } from "@/constants";
import { cn, formatMoney } from "@/lib/utils";
import { ReportParams, SalesReportDTO } from "../../dto/report.dto";
import { useSalesReport } from "../../hooks/useReports";
import { formatReportDate, formatReportDayShort } from "../../utils/report-period";
import {
  HorizontalBar,
  ReportEmpty,
  ReportError,
  ReportLoading,
  ReportSection,
  StatCard,
} from "./ReportBlocks";

const PAYMENT_METHOD_LABELS: Record<PaymentMethodEnum, string> = {
  [PaymentMethodEnum.CASH]: "Efectivo",
  [PaymentMethodEnum.QR]: "QR",
  [PaymentMethodEnum.BANK_TRANSFER]: "Transferencia",
};

const PAYMENT_METHOD_COLORS: Record<PaymentMethodEnum, string> = {
  [PaymentMethodEnum.CASH]: "bg-brand",
  [PaymentMethodEnum.QR]: "bg-sky-500",
  [PaymentMethodEnum.BANK_TRANSFER]: "bg-emerald-500",
};

const TOP_PRODUCTS_LIMIT = 5;
const NO_SALES_MESSAGE = "No hubo ventas en este período";

export function SalesReportTab({ params }: { params: ReportParams }) {
  const { data: report, status, error } = useSalesReport(params);

  if (status === "pending" && !report) return <ReportLoading />;
  if (status === "error") return <ReportError error={error} />;
  if (!report) return null;

  const hasSales = report.salesCount > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          label="Ventas netas"
          value={formatMoney(report.netTotal)}
          icon={Wallet}
        />
        <StatCard label="Ventas" value={report.salesCount} icon={Receipt} />
        <StatCard
          label="Ticket promedio"
          value={formatMoney(report.averageTicket)}
          icon={TrendingUp}
        />
      </div>

      {!hasSales ? (
        <ReportSection title="Ventas por día">
          <ReportEmpty message={NO_SALES_MESSAGE} />
        </ReportSection>
      ) : (
        <>
          <SalesByDayChart byDay={report.byDay} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PaymentMethodsBreakdown byPaymentMethod={report.byPaymentMethod} />
            <TopProducts topProducts={report.topProducts} />
          </div>
        </>
      )}
    </div>
  );
}

// ─── Ventas por día ──────────────────────────────────────────────────────────

function SalesByDayChart({ byDay }: { byDay: SalesReportDTO["byDay"] }) {
  const max = Math.max(...byDay.map((d) => d.total), 1);
  // Con rangos largos no caben todas las etiquetas: se muestra una de cada N.
  const labelEvery = byDay.length > 16 ? Math.ceil(byDay.length / 10) : 1;

  return (
    <ReportSection title="Ventas por día">
      <div className="flex items-end gap-1 h-48">
        {byDay.map((day) => (
          <div
            key={day.date}
            className="group relative flex-1 h-full flex items-end min-w-0"
          >
            <div
              className={cn(
                "w-full rounded-t-md transition-all duration-300",
                day.total > 0
                  ? "bg-brand/80 group-hover:bg-brand"
                  : "bg-surface",
              )}
              style={{
                height: day.total > 0 ? `${(day.total / max) * 100}%` : "2px",
              }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 whitespace-nowrap rounded-lg bg-inkblack px-2 py-1 text-[11px] text-white shadow-lg">
              <p className="font-medium">{formatReportDate(day.date)}</p>
              <p className="tabular-nums">
                {formatMoney(day.total)} · {day.salesCount}{" "}
                {day.salesCount === 1 ? "venta" : "ventas"}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-1 mt-1.5">
        {byDay.map((day, i) => (
          <span
            key={day.date}
            className="flex-1 min-w-0 text-center text-[10px] text-muted-foreground tabular-nums overflow-visible whitespace-nowrap"
          >
            {i % labelEvery === 0 ? formatReportDayShort(day.date) : ""}
          </span>
        ))}
      </div>
    </ReportSection>
  );
}

// ─── Cómo pagaron ────────────────────────────────────────────────────────────

function PaymentMethodsBreakdown({
  byPaymentMethod,
}: {
  byPaymentMethod: SalesReportDTO["byPaymentMethod"];
}) {
  return (
    <ReportSection title="Cómo pagaron">
      <div className="flex h-3 w-full rounded-full overflow-hidden bg-surface">
        {byPaymentMethod
          .filter((m) => m.percentage > 0)
          .map((m) => (
            <div
              key={m.method}
              className={cn("h-full", PAYMENT_METHOD_COLORS[m.method])}
              style={{ width: `${m.percentage}%` }}
              title={`${PAYMENT_METHOD_LABELS[m.method]}: ${m.percentage}%`}
            />
          ))}
      </div>

      <ul className="mt-4 flex flex-col gap-2.5">
        {byPaymentMethod.map((m) => (
          <li key={m.method} className="flex items-center gap-2.5 text-[12px]">
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full shrink-0",
                PAYMENT_METHOD_COLORS[m.method],
              )}
            />
            <span className="flex-1 font-medium text-inkblack">
              {PAYMENT_METHOD_LABELS[m.method] ?? m.method}
            </span>
            <span className="text-muted-foreground tabular-nums">
              {m.salesCount} {m.salesCount === 1 ? "venta" : "ventas"}
            </span>
            <span className="w-24 text-right font-medium text-inkblack tabular-nums">
              {formatMoney(m.total)}
            </span>
            <span className="w-12 text-right text-muted-foreground tabular-nums">
              {m.percentage.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </ReportSection>
  );
}

// ─── Productos más vendidos ──────────────────────────────────────────────────

function TopProducts({
  topProducts,
}: {
  topProducts: SalesReportDTO["topProducts"];
}) {
  const top = topProducts.slice(0, TOP_PRODUCTS_LIMIT);
  const max = Math.max(...top.map((p) => p.totalRevenue), 1);

  return (
    <ReportSection title="Productos más vendidos">
      {top.length === 0 ? (
        <ReportEmpty message={NO_SALES_MESSAGE} />
      ) : (
        <div className="flex flex-col gap-3">
          {top.map((p) => (
            <HorizontalBar
              key={p.productId}
              label={p.productName}
              detail={`${formatMoney(p.totalRevenue)} · ${p.quantitySold} u.`}
              ratio={p.totalRevenue / max}
            />
          ))}
        </div>
      )}
    </ReportSection>
  );
}
