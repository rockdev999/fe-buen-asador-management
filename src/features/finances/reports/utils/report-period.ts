// Periodos de los reportes. Todo se calcula con fechas locales (YYYY-MM-DD):
// nunca usar toISOString(), que pasa a UTC y después de las 20:00 en Bolivia
// devuelve el día siguiente. El backend interpreta cada día completo en hora
// de Bolivia.

const pad = (n: number) => String(n).padStart(2, "0");

/** Fecha local → "YYYY-MM-DD" (sin pasar por UTC). */
export const ymd = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const firstOfMonth = (y: number, m: number) => new Date(y, m, 1);
const lastOfMonth = (y: number, m: number) => new Date(y, m + 1, 0);

export type PeriodPreset =
  | "today"
  | "yesterday"
  | "week"
  | "month"
  | "lastMonth"
  | "quarter"
  | "year";

export type ReportPeriodMode = PeriodPreset | "months" | "custom";

export const REPORT_PERIOD_OPTIONS: { value: ReportPeriodMode; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "yesterday", label: "Ayer" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mes" },
  { value: "lastMonth", label: "Mes anterior" },
  { value: "quarter", label: "Este trimestre" },
  { value: "year", label: "Este año" },
  { value: "months", label: "Rango de meses" },
  { value: "custom", label: "Personalizado" },
];

/** Los más usados van como botones; el resto en "Más…". */
export const QUICK_PERIODS: ReportPeriodMode[] = ["today", "week", "month", "lastMonth"];

export const periodLabel = (mode: ReportPeriodMode) =>
  REPORT_PERIOD_OPTIONS.find((o) => o.value === mode)?.label ?? "";

export const DEFAULT_REPORT_PERIOD: PeriodPreset = "month";

/** Máximo de meses en "Rango de meses" (para no pasar de 366 días). */
export const MAX_MONTHS_RANGE = 12;
export const MAX_RANGE_DAYS = 366;

export interface DateRange {
  dateFrom: string;
  dateTo: string;
}

export function isPeriodPreset(value: string | null): value is PeriodPreset {
  return (
    !!value &&
    ["today", "yesterday", "week", "month", "lastMonth", "quarter", "year"].includes(
      value,
    )
  );
}

export function presetRange(p: PeriodPreset, now = new Date()): DateRange {
  const y = now.getFullYear();
  const m = now.getMonth();
  const today = ymd(now);
  switch (p) {
    case "today":
      return { dateFrom: today, dateTo: today };
    case "yesterday": {
      const d = new Date(y, m, now.getDate() - 1);
      return { dateFrom: ymd(d), dateTo: ymd(d) };
    }
    case "week": {
      const monday = new Date(y, m, now.getDate() - ((now.getDay() + 6) % 7));
      return { dateFrom: ymd(monday), dateTo: today };
    }
    case "month":
      return { dateFrom: ymd(firstOfMonth(y, m)), dateTo: today };
    case "lastMonth":
      return {
        dateFrom: ymd(firstOfMonth(y, m - 1)),
        dateTo: ymd(lastOfMonth(y, m - 1)),
      };
    case "quarter":
      return { dateFrom: ymd(firstOfMonth(y, m - (m % 3))), dateTo: today };
    case "year":
      return { dateFrom: `${y}-01-01`, dateTo: today };
  }
}

/** "2026-03", "2026-05" → { dateFrom: "2026-03-01", dateTo: "2026-05-31" } */
export function monthRange(fromYm: string, toYm: string): DateRange {
  const [fy, fm] = fromYm.split("-").map(Number);
  const [ty, tm] = toYm.split("-").map(Number);
  return {
    dateFrom: ymd(firstOfMonth(fy, fm - 1)),
    dateTo: ymd(lastOfMonth(ty, tm - 1)),
  };
}

/** Meses entre dos "YYYY-MM", ambos incluidos (negativo si están invertidos). */
export function monthsBetween(fromYm: string, toYm: string): number {
  const [fy, fm] = fromYm.split("-").map(Number);
  const [ty, tm] = toYm.split("-").map(Number);
  return (ty - fy) * 12 + (tm - fm) + 1;
}

const toUtcDay = (s: string) =>
  Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));

/** Días del rango, ambos extremos incluidos. */
export function rangeDays(dateFrom: string, dateTo: string): number {
  return (toUtcDay(dateTo) - toUtcDay(dateFrom)) / 86_400_000 + 1;
}

const YMD_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Mismas reglas que el backend. null = rango válido. */
export function validateRange(dateFrom: string, dateTo: string): string | null {
  if (!dateFrom || !dateTo) return "Selecciona ambas fechas";
  if (!YMD_RE.test(dateFrom) || !YMD_RE.test(dateTo)) return "Fecha inválida";
  if (dateFrom > dateTo) return "La fecha inicial no puede ser posterior a la final";
  if (rangeDays(dateFrom, dateTo) > MAX_RANGE_DAYS)
    return "El rango del reporte no puede superar 366 días";
  return null;
}

// ─── Periodo anterior (para comparar) ────────────────────────────────────────

const parseYmd = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const addDays = (s: string, n: number) => {
  const d = parseYmd(s);
  return ymd(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n));
};

const isLastOfMonth = (s: string) => addDays(s, 1).slice(8, 10) === "01";

/** Retrocede `n` meses; si el día no existe (31 → feb), usa el último del mes. */
function subMonths(s: string, n: number, toEndOfMonth = false): string {
  const d = parseYmd(s);
  const last = lastOfMonth(d.getFullYear(), d.getMonth() - n);
  if (toEndOfMonth) return ymd(last);
  return ymd(new Date(last.getFullYear(), last.getMonth(), Math.min(d.getDate(), last.getDate())));
}

/**
 * Periodo equivalente inmediatamente anterior, para mostrar la variación:
 * "Este mes" (1–22 nov) → 1–22 oct; "Mes anterior" → el mes previo completo;
 * "Este año" → mismo tramo del año pasado; personalizado → misma cantidad de
 * días justo antes.
 */
export function previousRange(mode: ReportPeriodMode, r: DateRange): DateRange {
  const byMonths = (n: number): DateRange => ({
    dateFrom: subMonths(r.dateFrom, n),
    dateTo: subMonths(r.dateTo, n, isLastOfMonth(r.dateTo) && r.dateFrom.endsWith("-01")),
  });
  switch (mode) {
    case "month":
    case "lastMonth":
      return byMonths(1);
    case "months":
      return byMonths(monthsBetween(r.dateFrom.slice(0, 7), r.dateTo.slice(0, 7)));
    case "quarter":
      return byMonths(3);
    case "year":
      return byMonths(12);
    default: {
      const days = rangeDays(r.dateFrom, r.dateTo);
      return { dateFrom: addDays(r.dateFrom, -days), dateTo: addDays(r.dateTo, -days) };
    }
  }
}

export function comparisonLabel(mode: ReportPeriodMode): string {
  switch (mode) {
    case "today":
    case "yesterday":
      return "vs día anterior";
    case "week":
      return "vs semana anterior";
    case "month":
    case "lastMonth":
      return "vs mes anterior";
    case "quarter":
      return "vs trimestre anterior";
    case "year":
      return "vs año anterior";
    default:
      return "vs periodo anterior";
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

const MONTH_SHORT = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

/** "2026-11" → "Nov 2026" */
export function formatReportMonth(ym: string): string {
  return `${MONTH_SHORT[+ym.slice(5, 7) - 1]} ${ym.slice(0, 4)}`;
}

/** Igual que el PDF: con más de 62 días el gráfico se agrupa por mes. */
export const GROUP_BY_MONTH_AFTER_DAYS = 62;

export interface SeriesPoint {
  /** "YYYY-MM-DD" o "YYYY-MM" si está agrupado por mes. */
  key: string;
  label: string;
  tooltip: string;
  total: number;
  salesCount: number;
}

export function buildSalesSeries(
  byDay: { date: string; total: number; salesCount: number }[],
): { grouped: boolean; points: SeriesPoint[] } {
  if (byDay.length <= GROUP_BY_MONTH_AFTER_DAYS) {
    return {
      grouped: false,
      points: byDay.map((d) => ({
        key: d.date,
        label: formatReportDayShort(d.date),
        tooltip: formatReportDate(d.date),
        total: d.total,
        salesCount: d.salesCount,
      })),
    };
  }

  const months = new Map<string, SeriesPoint>();
  for (const d of byDay) {
    const ym = d.date.slice(0, 7);
    const point = months.get(ym) ?? {
      key: ym,
      label: formatReportMonth(ym),
      tooltip: formatReportMonth(ym),
      total: 0,
      salesCount: 0,
    };
    point.total += d.total;
    point.salesCount += d.salesCount;
    months.set(ym, point);
  }
  return { grouped: true, points: [...months.values()] };
}
