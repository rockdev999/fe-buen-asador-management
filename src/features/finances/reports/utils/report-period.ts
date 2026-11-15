import { formatLocalDateInput } from "@/lib/formatters";

export type ReportPeriod = "last7Days" | "thisMonth" | "lastMonth";

export const REPORT_PERIOD_OPTIONS: { value: ReportPeriod; label: string }[] = [
  { value: "last7Days", label: "Últimos 7 días" },
  { value: "thisMonth", label: "Este mes" },
  { value: "lastMonth", label: "Mes pasado" },
];

export const DEFAULT_REPORT_PERIOD: ReportPeriod = "thisMonth";

/** Rango de días locales (YYYY-MM-DD) para el período elegido. */
export function getReportPeriodRange(
  period: ReportPeriod,
  today: Date = new Date(),
): { dateFrom: string; dateTo: string } {
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();

  switch (period) {
    case "last7Days":
      return {
        dateFrom: formatLocalDateInput(new Date(y, m, d - 6)),
        dateTo: formatLocalDateInput(today),
      };
    case "lastMonth":
      return {
        dateFrom: formatLocalDateInput(new Date(y, m - 1, 1)),
        // Día 0 del mes actual = último día del mes anterior.
        dateTo: formatLocalDateInput(new Date(y, m, 0)),
      };
    case "thisMonth":
    default:
      return {
        dateFrom: formatLocalDateInput(new Date(y, m, 1)),
        dateTo: formatLocalDateInput(today),
      };
  }
}

/** "2026-11-01" → "01/11/2026" sin pasar por Date (evita desfases de zona). */
export function formatReportDate(date: string): string {
  const [year, month, day] = date.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

/** "2026-11-01" → "01/11" para ejes compactos. */
export function formatReportDayShort(date: string): string {
  const [, month, day] = date.slice(0, 10).split("-");
  return `${day}/${month}`;
}
