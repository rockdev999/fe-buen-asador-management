import { QUERY_KEYS, RoleEnum } from "@/constants";
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

type ReportKind = "sales" | "expenses" | "payroll" | "ingredients";

// Los 4 reportes comparten parámetros y forma de consulta; solo cambia el
// endpoint. La query key incluye los params para que cambiar de período o
// sucursal no mezcle resultados en caché.
function useReport<TDto>(kind: ReportKind, params: ReportParams, enabled = true) {
  const queryParams = {
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    ...(params.locationId && { locationId: params.locationId }),
  };

  return useGetHandler<TDto>({
    queryKey: QUERY_KEYS.REPORT(kind, queryParams),
    queryFn: () =>
      httpClient
        .get<ApiResponse<TDto>>(`/finances/reports/${kind}`, {
          params: queryParams,
        })
        .then((r) => r.data.data!),
    enabled: enabled && !!params.dateFrom && !!params.dateTo,
    staleTime: 60 * 1000,
    retry: false,
    roles: [RoleEnum.MANAGER],
  });
}

export const useSalesReport = (params: ReportParams) =>
  useReport<SalesReportDTO>("sales", params);

export const useExpensesSummaryReport = (params: ReportParams) =>
  useReport<ExpensesSummaryReportDTO>("expenses", params);

export const usePayrollSummaryReport = (params: ReportParams) =>
  useReport<PayrollSummaryReportDTO>("payroll", params);

export const useIngredientsReport = (params: ReportParams) =>
  useReport<IngredientsReportDTO>("ingredients", params);
