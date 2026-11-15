import { AlertTriangle, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Estados de la pantalla ──────────────────────────────────────────────────

export function ReportLoading() {
  return (
    <div className="flex-1 flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current/30 border-t-current" />
        <span className="text-[12px]">Generando reporte...</span>
      </div>
    </div>
  );
}

// El interceptor rechaza con { message, status, errorCode }.
function getReportErrorMessage(error: unknown): string {
  const status = (error as { status?: number } | null)?.status;
  switch (status) {
    case 400:
      return "Faltan las fechas del período. Vuelve a elegir un período.";
    case 404:
      return "La sucursal seleccionada no existe.";
    case 403:
      return "Solo el gerente puede ver los reportes.";
    default:
      return (
        (error as { message?: string } | null)?.message ??
        "No se pudo generar el reporte."
      );
  }
}

export function ReportError({ error }: { error: unknown }) {
  return (
    <div className="flex-1 flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-2 text-center max-w-xs">
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
          <AlertTriangle size={20} />
        </div>
        <p className="text-[13px] text-inkblack/60">
          {getReportErrorMessage(error)}
        </p>
      </div>
    </div>
  );
}

export function ReportEmpty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center py-10">
      <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-inkblack/20">
        <BarChart3 size={20} />
      </div>
      <p className="text-[13px] text-inkblack/40">{message}</p>
    </div>
  );
}

// ─── Bloques de layout ───────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
}

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-surface bg-white p-4 flex items-center gap-3 min-w-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className="text-lg font-semibold text-inkblack tabular-nums truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

interface ReportSectionProps {
  title: string;
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function ReportSection({
  title,
  aside,
  className,
  children,
}: ReportSectionProps) {
  return (
    <section
      className={cn("rounded-2xl border border-surface bg-white p-4", className)}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** Barra horizontal simple (proporcional al máximo de la serie). */
export function HorizontalBar({
  label,
  detail,
  ratio,
}: {
  label: React.ReactNode;
  detail: React.ReactNode;
  ratio: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[12px] font-medium text-inkblack truncate">
          {label}
        </span>
        <span className="text-[12px] text-muted-foreground tabular-nums shrink-0">
          {detail}
        </span>
      </div>
      <div className="h-2 rounded-full bg-surface overflow-hidden">
        <div
          className="h-full rounded-full bg-brand transition-all duration-300"
          style={{ width: `${Math.max(0, Math.min(1, ratio)) * 100}%` }}
        />
      </div>
    </div>
  );
}
