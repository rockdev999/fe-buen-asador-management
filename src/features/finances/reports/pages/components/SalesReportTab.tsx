import { BadgePercent, Receipt, TrendingUp, Trophy, Wallet } from "lucide-react";
import { PaymentMethodEnum } from "@/constants";
import { cn, formatMoney } from "@/lib/utils";
import { SalesReportDTO } from "../../dto/report.dto";
import { useSalesReport } from "../../hooks/useReports";
import { buildSalesSeries, SeriesPoint } from "../../utils/report-period";
import {
  Delta,
  HorizontalBar,
  KpiCard,
  KpiGrid,
  ReportEmpty,
  ReportError,
  ReportLoading,
  ReportNote,
  ReportSection,
  ReportTabProps,
} from "./ReportBlocks";

const PAYMENT_METHODS: { method: PaymentMethodEnum; label: string; color: string }[] = [
  { method: PaymentMethodEnum.CASH, label: "Efectivo", color: "bg-brand" },
  { method: PaymentMethodEnum.QR, label: "QR", color: "bg-sky-500" },
  { method: PaymentMethodEnum.BANK_TRANSFER, label: "Tarjeta", color: "bg-emerald-500" },
];

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function SalesReportTab({ params, previous, compareLabel }: ReportTabProps) {
  const { data: report, previous: prev, status, error, isFetching, refetch } =
    useSalesReport(params, previous);

  if (status === "pending" && !report) return <ReportLoading />;
  if (status === "error") return <ReportError error={error} onRetry={() => refetch()} />;
  if (!report) return null;

  const hasSales = report.salesCount > 0;
  const grossSales = report.totalSales + report.totalDiscount;
  const discountPct = grossSales > 0 ? (report.totalDiscount / grossSales) * 100 : 0;

  return (
    <div className={cn("flex flex-col gap-4 transition-opacity", isFetching && "opacity-60")}>
      <KpiGrid>
        <KpiCard
          primary
          label="Total vendido (neto)"
          value={formatMoney(report.netTotal)}
          icon={Wallet}
          delta={<Delta current={report.netTotal} previous={prev?.netTotal} label={compareLabel} />}
        />
        <KpiCard
          label="Ventas realizadas"
          value={report.salesCount}
          icon={Receipt}
          delta={<Delta current={report.salesCount} previous={prev?.salesCount} label={compareLabel} />}
        />
        <KpiCard
          label="Ticket promedio"
          value={formatMoney(report.averageTicket)}
          icon={TrendingUp}
          hint="Lo que gasta un cliente en promedio"
          delta={
            <Delta current={report.averageTicket} previous={prev?.averageTicket} label={compareLabel} />
          }
        />
        <KpiCard
          label="Descuentos otorgados"
          value={formatMoney(report.totalDiscount)}
          icon={BadgePercent}
          hint={`${discountPct.toFixed(1)}% de las ventas brutas (${formatMoney(grossSales)})`}
        />
      </KpiGrid>

      {!hasSales ? (
        <ReportSection title="Ventas en el tiempo">
          <ReportEmpty />
        </ReportSection>
      ) : (
        <>
          <SalesOverTime byDay={report.byDay} />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <TopProducts className="lg:col-span-3" topProducts={report.topProducts} />
            <PaymentMethods
              className="lg:col-span-2"
              byPaymentMethod={report.byPaymentMethod}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ─── Ventas en el tiempo ─────────────────────────────────────────────────────

function SalesOverTime({ byDay }: { byDay: SalesReportDTO["byDay"] }) {
  // Igual que el PDF: con más de 62 días se agrupa por mes.
  const { grouped, points } = buildSalesSeries(byDay);
  const unit = grouped ? "mes" : "día";
  const max = Math.max(...points.map((p) => p.total), 1);
  const scaleMax = niceCeil(max);
  const average = points.reduce((s, p) => s + p.total, 0) / points.length;
  const best = points.reduce((a, b) => (b.total > a.total ? b : a));
  const activePoints = points.filter((p) => p.salesCount > 0).length;
  // Con muchos puntos no caben todas las etiquetas: se muestra una de cada N.
  const labelEvery = points.length > 16 ? Math.ceil(points.length / 10) : 1;

  return (
    <ReportSection
      title={grouped ? "Ventas por mes" : "Ventas por día"}
      subtitle={
        grouped
          ? "Agrupado por mes porque el periodo tiene más de 62 días"
          : "Pasa el cursor sobre una barra para ver el detalle"
      }
    >
      {/* Lectura rápida */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Insight
          icon={<Trophy size={13} />}
          label={`Mejor ${unit}`}
          value={best.tooltip}
          detail={formatMoney(best.total)}
        />
        <Insight
          label={`Promedio por ${unit}`}
          value={formatMoney(average)}
          detail="línea punteada"
        />
        <Insight
          label={grouped ? "Meses con ventas" : "Días con ventas"}
          value={`${activePoints} de ${points.length}`}
        />
      </div>

      <div className="flex gap-2">
        {/* Eje Y */}
        <div className="flex flex-col justify-between h-48 pb-px text-[10px] text-muted-foreground tabular-nums text-right w-14 shrink-0">
          <span>{compactMoney(scaleMax)}</span>
          <span>{compactMoney(scaleMax / 2)}</span>
          <span>0</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="relative h-48">
            {/* Grilla discreta */}
            {[0, 50, 100].map((t) => (
              <div
                key={t}
                className="absolute inset-x-0 border-t border-inkblack/[0.06]"
                style={{ bottom: `${t}%` }}
              />
            ))}
            {/* Promedio */}
            <div
              className="absolute inset-x-0 border-t border-dashed border-inkblack/30 z-[1] pointer-events-none"
              style={{ bottom: `${(average / scaleMax) * 100}%` }}
            />

            <div className={cn("relative flex items-end h-full", points.length > 31 ? "gap-px" : "gap-[2px]")}>
              {points.map((p) => (
                <Bar key={p.key} point={p} scaleMax={scaleMax} isBest={p.key === best.key} />
              ))}
            </div>
          </div>

          <div className={cn("flex mt-1.5", points.length > 31 ? "gap-px" : "gap-[2px]")}>
            {points.map((p, i) => (
              <span
                key={p.key}
                className="flex-1 min-w-0 text-center text-[10px] text-muted-foreground tabular-nums overflow-visible whitespace-nowrap"
              >
                {i % labelEvery === 0 ? p.label : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
    </ReportSection>
  );
}

function Bar({ point, scaleMax, isBest }: { point: SeriesPoint; scaleMax: number; isBest: boolean }) {
  return (
    // La zona de hover ocupa toda la columna, no solo la barra.
    <div className="group relative flex-1 h-full flex items-end min-w-0 cursor-default">
      <div
        className={cn(
          "w-full rounded-t-[4px] transition-colors",
          point.total <= 0
            ? "bg-inkblack/[0.06]"
            : isBest
              ? "bg-brand"
              : "bg-brand/55 group-hover:bg-brand/80",
        )}
        style={{ height: point.total > 0 ? `${(point.total / scaleMax) * 100}%` : "2px" }}
      />
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 whitespace-nowrap rounded-lg bg-inkblack px-2.5 py-1.5 text-[11px] text-white shadow-lg">
        <p className="font-semibold">{point.tooltip}</p>
        <p className="tabular-nums">{formatMoney(point.total)}</p>
        <p className="text-white/60">{plural(point.salesCount, "venta", "ventas")}</p>
      </div>
    </div>
  );
}

function Insight({
  icon,
  label,
  value,
  detail,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-surface/60 px-3 py-2">
      <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
        {icon && <span className="text-brand">{icon}</span>}
        {label}
      </p>
      <p className="text-[13px] font-semibold text-inkblack tabular-nums">
        {value}
        {detail && <span className="ml-1.5 font-normal text-muted-foreground">{detail}</span>}
      </p>
    </div>
  );
}

/** Redondea hacia arriba a 1, 2 o 5 × 10ⁿ para un eje legible. */
function niceCeil(n: number) {
  const pow = 10 ** Math.floor(Math.log10(n));
  const f = n / pow;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * pow;
}

function compactMoney(n: number) {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${+(n / 1_000).toFixed(1)}k`;
  return String(Math.round(n));
}

// ─── Cómo pagaron ────────────────────────────────────────────────────────────

function PaymentMethods({
  byPaymentMethod,
  className,
}: {
  byPaymentMethod: SalesReportDTO["byPaymentMethod"];
  className?: string;
}) {
  // Color fijo por método (no por posición): siempre el mismo en cada periodo.
  const rows = PAYMENT_METHODS.map((m) => ({
    ...m,
    data: byPaymentMethod.find((b) => b.method === m.method),
  }));

  return (
    <ReportSection title="Cómo pagaron" subtitle="Porcentaje del total vendido" className={className}>
      <div className="flex h-3 w-full gap-[2px] rounded-full overflow-hidden bg-surface">
        {rows
          .filter((r) => (r.data?.percentage ?? 0) > 0)
          .map((r) => (
            <div
              key={r.method}
              className={cn("h-full first:rounded-l-full last:rounded-r-full", r.color)}
              style={{ width: `${r.data!.percentage}%` }}
              title={`${r.label}: ${r.data!.percentage.toFixed(1)}%`}
            />
          ))}
      </div>

      <ul className="mt-4 flex flex-col divide-y divide-surface">
        {rows.map((r) => (
          <li key={r.method} className="flex items-center gap-2.5 py-2.5 text-[12px]">
            <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", r.color)} />
            <span className="flex-1 min-w-0">
              <span className="block font-medium text-inkblack">{r.label}</span>
              <span className="block text-[11px] text-muted-foreground">
                {plural(r.data?.salesCount ?? 0, "venta", "ventas")}
              </span>
            </span>
            <span className="text-right">
              <span className="block font-semibold text-inkblack tabular-nums">
                {formatMoney(r.data?.total ?? 0)}
              </span>
              <span className="block text-[11px] text-muted-foreground tabular-nums">
                {(r.data?.percentage ?? 0).toFixed(1)}%
              </span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-2">
        <ReportNote>
          Una venta pagada con dos métodos cuenta en ambos, por eso la suma puede
          superar el total.
        </ReportNote>
      </div>
    </ReportSection>
  );
}

// ─── Productos más vendidos ──────────────────────────────────────────────────

function TopProducts({
  topProducts,
  className,
}: {
  topProducts: SalesReportDTO["topProducts"];
  className?: string;
}) {
  const max = Math.max(...topProducts.map((p) => p.totalRevenue), 1);

  return (
    <ReportSection
      title="Productos más vendidos"
      subtitle="Top 10 por ingreso · el PDF incluye todos los productos"
      className={className}
    >
      {topProducts.length === 0 ? (
        <ReportEmpty />
      ) : (
        <div className="flex flex-col gap-3.5">
          {topProducts.map((p, i) => (
            <HorizontalBar
              key={p.productId}
              rank={i + 1}
              label={p.productName}
              value={formatMoney(p.totalRevenue)}
              detail={`${p.quantitySold} u.`}
              ratio={p.totalRevenue / max}
            />
          ))}
        </div>
      )}
    </ReportSection>
  );
}
