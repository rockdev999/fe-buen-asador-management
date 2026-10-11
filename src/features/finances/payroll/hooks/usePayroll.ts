import { toUtcDateRangeParams } from "@/lib/formatters";
import { DATA_TABLE, QUERY_KEYS, RoleEnum } from "@/constants";
import {
  useGetHandler,
  usePaginatedGetHandler,
  usePostHandler,
} from "@/hooks/api.handlers";
import { httpClient } from "@/services/http.client";
import { ApiErrorResponse, ApiResponse } from "@/types/api.types";
import { useMemo } from "react";
import {
  CreatePayrollBatchDTO,
  CreatePayrollDTO,
  PaySheetItemDTO,
  PayrollPageItemDTO,
  PayrollPaymentDTO,
  PayrollReportDTO,
} from "../dto/payroll.dto";
import {
  mapPaySheetItemDTOToModel,
  mapPayrollPageItemDTOToModel,
  mapPayrollPaymentDTOToModel,
  mapPayrollReportDTOToModel,
} from "../mappers/payroll.mapper";

// GET /finances/payroll/:locationId/pay-sheet — hoja de pago con los
// empleados activos de la sucursal, su sueldo diario y si ya se les pagó
// hoy (informativo, no bloquea). Usado por CASHIER para el pago masivo y
// por ADMIN/MANAGER para gestionar el sueldo diario de sus trabajadores.
export function usePayrollPaySheet(locationId: string) {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.PAYROLL_PAY_SHEET(locationId),
    queryFn: () =>
      httpClient
        .get<
          ApiResponse<PaySheetItemDTO[]>
        >(`/finances/payroll/${locationId}/pay-sheet`)
        .then((r) => r.data.data!),
    enabled: !!locationId,
    staleTime: 0,
    roles: [RoleEnum.CASHIER, RoleEnum.ADMIN, RoleEnum.MANAGER],
  });

  const data = useMemo(
    () => (handler.data ? handler.data.map(mapPaySheetItemDTOToModel) : null),
    [handler.data],
  );

  return { ...handler, data };
}

interface UsePayrollListParams {
  locationId?: string;
  shiftId?: string;
}

// GET /finances/payroll — lista simple, pensada para el listado del turno
// activo del CASHIER (?shiftId=). Solo MANAGER puede omitir locationId.
export function usePayrollList({ locationId, shiftId }: UsePayrollListParams) {
  const params = {
    ...(locationId && { locationId }),
    ...(shiftId && { shiftId }),
  };

  const handler = useGetHandler({
    queryKey: QUERY_KEYS.PAYROLL(params),
    queryFn: () =>
      httpClient
        .get<ApiResponse<PayrollPaymentDTO[]>>("/finances/payroll", { params })
        .then((r) => r.data.data!),
    enabled: !!shiftId,
    staleTime: 0,
  });

  const data = useMemo(
    () => (handler.data ? handler.data.map(mapPayrollPaymentDTOToModel) : null),
    [handler.data],
  );

  return { ...handler, data };
}

interface UsePayrollPageParams {
  locationId?: string;
  page: number;
  search?: string;
  shiftId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// GET /finances/payroll/page — tabla con búsqueda, filtro de fechas y
// paginación. CASHIER/ADMIN: locationId se ignora, el backend siempre
// devuelve su propia sucursal. MANAGER: sin locationId ve todas las
// sucursales (la respuesta trae `location` por fila), con locationId filtra
// una sola.
export function usePayrollPage({
  locationId,
  page,
  search,
  shiftId,
  dateFrom,
  dateTo,
}: UsePayrollPageParams) {
  const params = {
    page,
    limit: DATA_TABLE.PAYROLL.limit ?? 10,
    ...(locationId && { locationId }),
    ...(search && { search }),
    ...(shiftId && { shiftId }),
    ...toUtcDateRangeParams(dateFrom, dateTo),
  };

  return usePaginatedGetHandler<
    PayrollPageItemDTO,
    ReturnType<typeof mapPayrollPageItemDTOToModel>
  >({
    queryKey: QUERY_KEYS.PAGINATION_PAYROLL(params),
    queryFn: () =>
      httpClient
        .get<ApiResponse<PayrollPageItemDTO[]>>("/finances/payroll/page", {
          params,
        })
        .then((r) => r.data),
    select: mapPayrollPageItemDTOToModel,
    params,
    staleTime: 0,
    roles: [RoleEnum.CASHIER, RoleEnum.ADMIN, RoleEnum.MANAGER],
  });
}

// Detalle solo para ADMIN/MANAGER — CASHIER recibe 403 del backend.
export const useGetPayrollById = (id: string | null) => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.PAYROLL_DETAIL(id ?? ""),
    queryFn: () =>
      httpClient
        .get<ApiResponse<PayrollPaymentDTO>>(`/finances/payroll/${id}`)
        .then((r) => r.data.data!),
    enabled: !!id,
    staleTime: 0,
    roles: [RoleEnum.MANAGER, RoleEnum.ADMIN],
  });

  const data = useMemo(
    () => (handler.data ? mapPayrollPaymentDTOToModel(handler.data) : null),
    [handler.data],
  );

  return { ...handler, data };
};

interface PayrollMutationOptions {
  onErrorCallback?: (error: ApiErrorResponse) => void;
}

// Único CASHIER puede registrar — ADMIN/MANAGER reciben 403 del backend
// (ellos solo consultan y gestionan el sueldo diario). Sucursal y turno se
// resuelven en el backend a partir del token y del turno abierto.
// Errores esperados: 400 shifts.NOT_OPEN (sin turno abierto),
// 404 CATEGORY_NOT_FOUND (falta seed de categoría PERSONNEL).
export const useCreatePayroll = (options?: PayrollMutationOptions) => {
  const handler = usePostHandler({
    mutationFn: (dto: CreatePayrollDTO) =>
      httpClient
        .post<ApiResponse<PayrollPaymentDTO>>("/finances/payroll", dto)
        .then((r) => r.data.data!),
    invalidateKeys: [],
    successMessage: "Pago de nómina registrado exitosamente",
    onErrorCallback: options?.onErrorCallback,
  });

  return { ...handler };
};

// Único CASHIER puede registrar hasta 200 pagos en una sola transacción —
// valida turno abierto una sola vez y revierte todo el lote si cualquier
// pago falla. Mismos errores esperados que el registro individual.
export const useCreatePayrollBatch = (options?: PayrollMutationOptions) => {
  const handler = usePostHandler({
    mutationFn: (dto: CreatePayrollBatchDTO) =>
      httpClient
        .post<
          ApiResponse<PayrollPaymentDTO[]>
        >("/finances/payroll/batch", dto)
        .then((r) => r.data.data!),
    invalidateKeys: [],
    successMessage: "Pagos de nómina registrados exitosamente",
    onErrorCallback: options?.onErrorCallback,
  });

  return { ...handler };
};

interface UsePayrollReportParams {
  locationId?: string;
  dateFrom: string;
  dateTo: string;
}

// GET /finances/reports/payroll — ADMIN/MANAGER. Para ADMIN, locationId es
// opcional en el hook porque el backend lo resuelve solo con su sucursal
// fija; para MANAGER, omitirlo agrega todas las sucursales.
export function usePayrollReport({
  locationId,
  dateFrom,
  dateTo,
}: UsePayrollReportParams) {
  const params = {
    ...(locationId && { locationId }),
    ...toUtcDateRangeParams(dateFrom, dateTo),
  };

  const handler = useGetHandler({
    queryKey: QUERY_KEYS.PAYROLL_REPORT(params),
    queryFn: () =>
      httpClient
        .get<
          ApiResponse<PayrollReportDTO>
        >("/finances/reports/payroll", { params })
        .then((r) => r.data.data!),
    enabled: !!dateFrom && !!dateTo,
    staleTime: 0,
    roles: [RoleEnum.MANAGER, RoleEnum.ADMIN],
  });

  const data = useMemo(
    () => (handler.data ? mapPayrollReportDTOToModel(handler.data) : null),
    [handler.data],
  );

  return { ...handler, data };
}
