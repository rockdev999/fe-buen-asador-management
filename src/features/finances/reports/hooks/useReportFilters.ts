import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ReportKind } from "../config/report-tabs";
import {
  DateRange,
  DEFAULT_REPORT_PERIOD,
  isPeriodPreset,
  monthRange,
  presetRange,
  ReportPeriodMode,
  validateRange,
  ymd,
} from "../utils/report-period";

// Los filtros viven en la URL (?tab=&period=&dateFrom=&dateTo=&locationId=)
// para poder compartir el enlace y no perderlos al recargar.
//  - Con un preset solo se guarda `period`: el rango se recalcula cada día
//    (un enlace "Este mes" guardado sigue siendo "este mes").
//  - Con "months" o "custom" se guardan las fechas exactas.

export interface ReportFilters {
  tab: ReportKind | null;
  mode: ReportPeriodMode;
  range: DateRange;
  locationId: string;
  rangeError: string | null;
}

const YMD_RE = /^\d{4}-\d{2}-\d{2}$/;

export function useReportFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<ReportFilters>(() => {
    const rawPeriod = searchParams.get("period");
    const dateFrom = searchParams.get("dateFrom") ?? "";
    const dateTo = searchParams.get("dateTo") ?? "";

    let mode: ReportPeriodMode;
    let range: DateRange;
    if (rawPeriod === "months" || rawPeriod === "custom") {
      mode = rawPeriod;
      range = {
        dateFrom: YMD_RE.test(dateFrom) ? dateFrom : "",
        dateTo: YMD_RE.test(dateTo) ? dateTo : "",
      };
    } else if (!rawPeriod && dateFrom && dateTo) {
      // Enlace con fechas sueltas (como sugiere la guía del backend).
      mode = "custom";
      range = { dateFrom, dateTo };
    } else {
      mode = isPeriodPreset(rawPeriod) ? rawPeriod : DEFAULT_REPORT_PERIOD;
      range = presetRange(mode);
    }

    return {
      tab: (searchParams.get("tab") as ReportKind | null) ?? null,
      mode,
      range,
      locationId: searchParams.get("locationId") ?? "",
      rangeError: validateRange(range.dateFrom, range.dateTo),
    };
  }, [searchParams]);

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) {
            if (v) next.set(k, v);
            else next.delete(k);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setTab = useCallback((tab: ReportKind) => update({ tab }), [update]);

  const setLocationId = useCallback(
    (locationId: string) => update({ locationId: locationId || null }),
    [update],
  );

  /** Cambia el modo. Al pasar a months/custom parte del rango que se veía. */
  const setMode = useCallback(
    (mode: ReportPeriodMode) => {
      if (mode === "months" || mode === "custom") {
        const ym = filters.range.dateFrom.slice(0, 7) || ymd(new Date()).slice(0, 7);
        const range = mode === "months" ? monthRange(ym, ym) : filters.range;
        update({ period: mode, dateFrom: range.dateFrom, dateTo: range.dateTo });
      } else {
        update({ period: mode, dateFrom: null, dateTo: null });
      }
    },
    [update, filters.range],
  );

  const setRange = useCallback(
    (range: DateRange) =>
      update({ dateFrom: range.dateFrom || null, dateTo: range.dateTo || null }),
    [update],
  );

  return { filters, setTab, setMode, setRange, setLocationId };
}
