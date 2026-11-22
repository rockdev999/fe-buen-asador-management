import { useState } from "react";
import { QUERY_KEYS } from "@/constants";
import { useGetHandler } from "@/hooks/api.handlers";
import { httpClient } from "@/services/http.client";
import { ApiResponse } from "@/types/api.types";
import {
  ExpensesSummaryReportDTO,
  IngredientsReportDTO,
  PayrollSummaryReportDTO,
  ReportParams,
  SalesReportDTO,
} from "../dto/report.dto";
import { REPORT_ROLES, ReportKind } from "../config/report-tabs";
import { downloadReportPdf, PdfReport, PdfReportParams } from "../services/report-pdf";
import { validateRange } from "../utils/report-period";

// Los 4 reportes comparten parámetros y forma de consulta; solo cambia el
// endpoint. La query key incluye los params para que cambiar de período o
// sucursal no mezcle resultados en caché.
function useReport<TDto>(
  kind: ReportKind,
  params: ReportParams | null,
  { silent = false }: { silent?: boolean } = {},
) {
  const queryParams = params && {
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    ...(params.locationId && { locationId: params.locationId }),
  };

  return useGetHandler<TDto>({
    queryKey: QUERY_KEYS.REPORT(kind, queryParams ?? {}),
    queryFn: () =>
      httpClient
        .get<ApiResponse<TDto>>(`/finances/reports/${kind}`, {
          params: queryParams,
          silentErrors: silent,
        })
        .then((r) => r.data.data!),
    // No se pide nada con un rango que el backend rechazaría.
    enabled: !!params && validateRange(params.dateFrom, params.dateTo) === null,
    staleTime: 60 * 1000,
    retry: false,
    // Mientras llega el nuevo período se sigue mostrando el anterior.
    placeholderData: (prev) => prev,
    roles: REPORT_ROLES[kind],
  });
}

/**
 * Reporte del periodo elegido + el del periodo anterior (para la variación en
 * las tarjetas). El anterior es silencioso: si falla, solo no se muestra la
 * comparación.
 */
function useComparedReport<TDto>(
  kind: ReportKind,
  params: ReportParams,
  previous: ReportParams | null,
) {
  const current = useReport<TDto>(kind, params);
  const prev = useReport<TDto>(kind, previous, { silent: true });
  // Solo se compara cuando el anterior corresponde a estos mismos filtros.
  const previousData = prev.isPlaceholderData ? null : prev.data;
  return { ...current, previous: previousData };
}

export const useSalesReport = (params: ReportParams, previous: ReportParams | null) =>
  useComparedReport<SalesReportDTO>("sales", params, previous);

export const useExpensesSummaryReport = (
  params: ReportParams,
  previous: ReportParams | null,
) => useComparedReport<ExpensesSummaryReportDTO>("expenses", params, previous);

export const usePayrollSummaryReport = (
  params: ReportParams,
  previous: ReportParams | null,
) => useComparedReport<PayrollSummaryReportDTO>("payroll", params, previous);

export const useIngredientsReport = (
  params: ReportParams,
  previous: ReportParams | null,
) => useComparedReport<IngredientsReportDTO>("ingredients", params, previous);

/** Estado de una descarga de PDF (spinner del botón). */
export function useReportPdfDownload() {
  const [pending, setPending] = useState<PdfReport | null>(null);

  async function download(type: PdfReport, params: PdfReportParams) {
    if (pending) return;
    setPending(type);
    try {
      await downloadReportPdf(type, params);
    } catch {
      // El interceptor ya mostró el toast con el mensaje del backend.
    } finally {
      setPending(null);
    }
  }

  return { download, pending };
}
