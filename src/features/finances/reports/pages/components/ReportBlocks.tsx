import { AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, Info, Minus, RotateCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ReportParams } from "../../dto/report.dto";

/** Props comunes de cada pestaña. */
export interface ReportTabProps {
  params: ReportParams;
  /** Periodo anterior equivalente (null = no comparar). */
  previous: ReportParams | null;
  /** "vs mes anterior", "vs periodo anterior"… */
  compareLabel: string;
}

// ─── Estados de la pantalla ──────────────────────────────────────────────────

/** Esqueleto con la misma forma que el reporte: no "salta" al cargar. */
export function ReportLoading({ cards = 4 }: { cards?: number }) {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Generando reporte">
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3", cards === 4 && "xl:grid-cols-4")}>
        {Array.from({ length: cards }, (_, i) => (
          <div key={i} className="rounded-2xl border border-surface bg-white p-4">
            <Skeleton className="h-3 w-24 bg-surface" />
            <Skeleton className="mt-3 h-7 w-32 bg-surface" />
            <Skeleton className="mt-2 h-3 w-20 bg-surface" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-surface bg-white p-4">
        <Skeleton className="h-3 w-28 bg-surface" />
        <div className="mt-4 flex items-end gap-1 h-40">
          {[40, 65, 30, 80, 55, 70, 45, 90, 60, 35, 75, 50].map((h, i) => (
            <Skeleton key={i} className="flex-1 bg-surface" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ReportError({
  error,
  onRetry,
  messages,
}: {
  error: unknown;
  onRetry?: () => void;
  /** Mensajes por código HTTP que reemplazan al del backend (Dashboard). */
  messages?: Record<number, string>;
}) {
  // El interceptor rechaza con { message, status }: ya viene en español.
  const status = (error as { status?: number } | null)?.status;
  const message =
    (status && messages?.[status]) ||
    ((error as { message?: string } | null)?.message ?? "No se pudo generar el reporte.");
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3 text-center max-w-sm">
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
          <AlertTriangle size={20} />
        </div>
        <p className="text-[13px] text-inkblack/70">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-surface text-[12px] font-medium text-inkblack hover:border-brand/40 hover:text-brand"
          >
            <RotateCw size={12} />
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}

export function ReportEmpty({
  message = "Sin movimientos en el periodo",
  hint = "Prueba con otro periodo o sucursal. El PDF sigue disponible.",
}: {
  message?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center py-10">
      <div className="mb-1 w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-inkblack/25">
        <BarChart3 size={20} />
      </div>
      <p className="text-[13px] font-medium text-inkblack/60">{message}</p>
      {hint && <p className="text-[12px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Aclaración sobre los datos (p. ej. "incluye nómina"). */
export function ReportNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
      <Info size={12} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

// ─── Tarjetas de resumen ─────────────────────────────────────────────────────

interface DeltaProps {
  current: number;
  previous: number | null | undefined;
  /** Si subir es bueno (ventas) o malo (gastos). "neutral" = sin color. */
  goodWhen?: "up" | "down" | "neutral";
  label: string;
}

/** Variación vs el periodo anterior: flecha + % + texto (nunca solo color). */
export function Delta({ current, previous, goodWhen = "up", label }: DeltaProps) {
  if (previous === null || previous === undefined) return null;
  // Sin base de comparación (periodo anterior en 0): no se muestra nada para
  // no llenar las tarjetas de avisos.
  if (previous === 0) return null;
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  const flat = Math.abs(pct) < 0.5;
  const up = pct > 0;
  const good = goodWhen === "neutral" || flat ? null : goodWhen === "up" ? up : !up;
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;

  return (
    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded-md px-1 py-px font-semibold tabular-nums",
          good === true && "bg-emerald-50 text-emerald-700",
          good === false && "bg-red-50 text-red-700",
          good === null && "bg-surface text-inkblack/70",
        )}
      >
        <Icon size={11} />
        {flat ? "0%" : `${Math.abs(pct).toFixed(Math.abs(pct) < 10 ? 1 : 0)}%`}
      </span>
      {label}
    </span>
  );
}

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
  hint?: React.ReactNode;
  delta?: React.ReactNode;
  /** Destaca la métrica principal de la pestaña. */
  primary?: boolean;
}

export function KpiCard({ label, value, icon: Icon, hint, delta, primary }: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 flex flex-col gap-1 min-w-0",
        primary ? "border-brand/20 bg-gradient-to-br from-brand/[0.07] to-white" : "border-surface bg-white",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium text-muted-foreground truncate">{label}</p>
        <Icon size={15} className={primary ? "text-brand" : "text-inkblack/30"} />
      </div>
      <p
        className={cn(
          "font-semibold text-inkblack tabular-nums truncate",
          primary ? "text-2xl" : "text-xl",
        )}
      >
        {value}
      </p>
      {delta}
      {hint && <p className="text-[11px] text-muted-foreground truncate">{hint}</p>}
    </div>
  );
}

/** Tarjeta compacta con icono (la usa el Dashboard). */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
  hint?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-surface bg-white p-4 flex items-center gap-3 min-w-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className="text-lg font-semibold text-inkblack tabular-nums truncate">{value}</p>
        {hint && <p className="text-[11px] text-muted-foreground truncate">{hint}</p>}
      </div>
    </div>
  );
}

export function KpiGrid({ children, cols = 4 }: { children: React.ReactNode; cols?: 2 | 3 | 4 }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 gap-3",
        cols === 3 && "lg:grid-cols-3",
        cols === 4 && "xl:grid-cols-4",
      )}
    >
      {children}
    </div>
  );
}

// ─── Secciones ───────────────────────────────────────────────────────────────

interface ReportSectionProps {
  title: string;
  subtitle?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function ReportSection({ title, subtitle, aside, className, children }: ReportSectionProps) {
  return (
    <section className={cn("rounded-2xl border border-surface bg-white p-4", className)}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-inkblack">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** Fila con barra proporcional (ranking o composición). */
export function HorizontalBar({
  rank,
  label,
  value,
  detail,
  ratio,
}: {
  rank?: number;
  label: React.ReactNode;
  value: React.ReactNode;
  detail?: React.ReactNode;
  ratio: number;
}) {
  return (
    <div className="flex items-start gap-3">
      {rank !== undefined && (
        <span className="w-5 shrink-0 pt-px text-right text-[12px] font-semibold text-inkblack/30 tabular-nums">
          {rank}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-1.5">
          <span className="text-[12px] font-medium text-inkblack truncate">{label}</span>
          <span className="shrink-0 text-[12px] tabular-nums">
            <span className="font-semibold text-inkblack">{value}</span>
            {detail && <span className="ml-1.5 text-muted-foreground">{detail}</span>}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-surface overflow-hidden">
          <div
            className="h-full rounded-full bg-brand transition-all duration-500"
            style={{ width: `${Math.max(0, Math.min(1, ratio)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
