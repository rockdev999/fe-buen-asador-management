import { DATA_TABLE, QUERY_KEYS, RoleEnum } from "@/constants";
import {
  useDeleteHandler,
  useGetHandler,
  usePaginatedGetHandler,
  usePostHandler,
  usePutHandler,
} from "@/hooks/api.handlers";
import { httpClient } from "@/services/http.client";
import { ApiErrorResponse, ApiResponse } from "@/types/api.types";
import { useMemo } from "react";
import {
  CreateExpenseDTO,
  ExpenseCategoryOptionDTO,
  ExpenseDTO,
  ExpensePageItemDTO,
  ExpensesReportDTO,
  UpdateExpenseDTO,
} from "../dto/expense.dto";
import {
  mapExpenseCategoryOptionDTOToModel,
  mapExpenseDTOToModel,
  mapExpensePageItemDTOToModel,
  mapExpensesReportDTOToModel,
} from "../mappers/expense.mapper";

// Categorías fijas del backend (SERVICES, PERSONNEL, SUPPLIES, MAINTENANCE,
// OTHER) — se consultan igual porque el `id` real es un uuid de BD.
export const useExpenseCategories = () => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.EXPENSE_CATEGORIES,
    queryFn: () =>
      httpClient
        .get<
          ApiResponse<ExpenseCategoryOptionDTO[]>
        >("/finances/expenses/categories")
        .then((r) => r.data.data!),
    staleTime: 10 * 60 * 1000, // 10 minutes — son fijas
  });

  const data = useMemo(
    () =>
      handler.data ? handler.data.map(mapExpenseCategoryOptionDTOToModel) : null,
    [handler.data],
  );

  return { ...handler, data };
};

interface UseExpensesPageParams {
  locationId: string;
  page: number;
  categoryId?: string;
  shiftId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// GET /finances/expenses/location/:locationId/page — es la única ruta
// paginada; no existe una versión "todas las sucursales", por lo que
// siempre requiere un locationId (elegido por el usuario o fijo por su rol).
// El orden viene fijo desde el backend (createdAt DESC, id DESC), por eso
// no se envían sortBy/sortOrder.
export function useExpensesPage({
  locationId,
  page,
  categoryId,
  shiftId,
  dateFrom,
  dateTo,
  search,
}: UseExpensesPageParams) {
  const params = {
    page,
    limit: DATA_TABLE.EXPENSES.limit ?? 10,
    ...(categoryId && { categoryId }),
    ...(shiftId && { shiftId }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
    ...(search && { search }),
  };

  return usePaginatedGetHandler<
    ExpensePageItemDTO,
    ReturnType<typeof mapExpensePageItemDTOToModel>
  >({
    queryKey: QUERY_KEYS.PAGINATION_EXPENSES({ locationId, ...params }),
    queryFn: () =>
      httpClient
        .get<
          ApiResponse<ExpensePageItemDTO[]>
        >(`/finances/expenses/location/${locationId}/page`, { params })
        .then((r) => r.data),
    select: mapExpensePageItemDTOToModel,
    params,
    enabled: !!locationId,
    staleTime: 0,
  });
}

// Detalle solo para ADMIN/MANAGER — CASHIER recibe 403 del backend.
export const useGetExpenseById = (id: string | null) => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.EXPENSE(id ?? ""),
    queryFn: () =>
      httpClient
        .get<ApiResponse<ExpenseDTO>>(`/finances/expenses/${id}`)
        .then((r) => r.data.data!),
    enabled: !!id,
    staleTime: 0, // siempre fresco, se edita justo después de abrir el modal
    roles: [RoleEnum.MANAGER, RoleEnum.ADMIN],
  });

  const data = useMemo(
    () => (handler.data ? mapExpenseDTOToModel(handler.data) : null),
    [handler.data],
  );

  return { ...handler, data };
};

interface ExpenseMutationOptions {
  onErrorCallback?: (error: ApiErrorResponse) => void;
}

// Solo CASHIER puede crear — la sucursal y el turno se resuelven en el
// backend a partir del token y del turno abierto, no se envían.
// Errores esperados: 400 shifts.NOT_OPEN (sin turno abierto),
// 404 CATEGORY_NOT_FOUND.
export const useCreateExpense = (options?: ExpenseMutationOptions) => {
  const handler = usePostHandler({
    mutationFn: (dto: CreateExpenseDTO) =>
      httpClient
        .post<ApiResponse<ExpenseDTO>>("/finances/expenses", dto)
        .then((r) => r.data.data!),
    invalidateKeys: [],
    successMessage: "Egreso registrado exitosamente",
    onErrorCallback: options?.onErrorCallback,
  });

  return { ...handler };
};

// PUT completo — el backend no soporta PATCH, siempre hay que enviar los
// 4 campos del DTO.
export const useUpdateExpense = (
  id: string,
  options?: ExpenseMutationOptions,
) => {
  const handler = usePutHandler({
    mutationFn: (dto: UpdateExpenseDTO) =>
      httpClient
        .put<ApiResponse<ExpenseDTO>>(`/finances/expenses/${id}`, dto)
        .then((r) => r.data.data!),
    invalidateKeys: [],
    successMessage: "Egreso actualizado exitosamente",
    onErrorCallback: options?.onErrorCallback,
  });

  return { ...handler };
};

// Hard delete, sin restricción de turno.
export const useDeleteExpense = (id: string) => {
  const handler = useDeleteHandler({
    mutationFn: () =>
      httpClient
        .delete<ApiResponse<null>>(`/finances/expenses/${id}`)
        .then((r) => r.data.data!),
    invalidateKeys: [],
    successMessage: "Egreso eliminado exitosamente",
  });

  return { ...handler };
};

interface UseExpensesReportParams {
  locationId: string;
  dateFrom: string;
  dateTo: string;
}

// GET /finances/reports/expenses usa resolveLocationId (no la variante
// opcional): sin locationId el backend responde 400 LOCATION_ID_REQUIRED,
// así que el hook no dispara la petición hasta tener los 3 params.
export function useExpensesReport({
  locationId,
  dateFrom,
  dateTo,
}: UseExpensesReportParams) {
  const params = { locationId, dateFrom, dateTo };

  const handler = useGetHandler({
    queryKey: QUERY_KEYS.EXPENSES_REPORT(params),
    queryFn: () =>
      httpClient
        .get<
          ApiResponse<ExpensesReportDTO>
        >("/finances/reports/expenses", { params })
        .then((r) => r.data.data!),
    enabled: !!locationId && !!dateFrom && !!dateTo,
    staleTime: 0,
  });

  const data = useMemo(
    () => (handler.data ? mapExpensesReportDTOToModel(handler.data) : null),
    [handler.data],
  );

  return { ...handler, data };
}
