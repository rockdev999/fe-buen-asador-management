import {
  useGetHandler,
  usePaginatedGetHandler,
  usePostHandler,
} from "@/hooks/api.handlers";
import {
  ShiftApproveDTO,
  ShiftCloseDTO,
  ShiftCloseResponseDTO,
  ShiftDTO,
  ShiftReceiptDTO,
  ShiftOpenDTO,
  ShiftSummaryDTO,
} from "../dto/shift.dto";
import { httpClient, NO_TIMEOUT } from "@/services/http.client";
import {
  mapShiftDTOToModel,
  mapShiftSummaryDTOToModel,
} from "../mappers/shift.mapper";
import { DATA_TABLE, QUERY_KEYS, RoleEnum, ShiftStatusEnum } from "@/constants";
import { ApiResponse } from "@/types/api.types";
import { useMemo } from "react";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { toUtcDateRangeParams } from "@/lib/formatters";
import {
  fallbackWhenOffline,
  offlineCache,
} from "@/features/offline/services/offline-cache";

// ─── Cajero ───────────────────────────────────────────────────────────────────

// Para el CASHIER, el backend filtra egresos y nómina por su turno OPEN: al
// abrir o cerrar turno esas listas cambian aunque sus parámetros no.
const SHIFT_SCOPED_KEYS = [
  ["finances", "expenses"],
  ["finances", "payroll"],
] as const;

function invalidateShiftScoped(queryClient: QueryClient) {
  SHIFT_SCOPED_KEYS.forEach((queryKey) =>
    queryClient.invalidateQueries({ queryKey }),
  );
}

// POST /shifts/open — deja el turno OPEN y refresca GET /shifts/active.
export const useOpenShiftHandler = () => {
  const queryClient = useQueryClient();

  return usePostHandler({
    mutationFn: (dto: ShiftOpenDTO) =>
      httpClient
        .post<ApiResponse<ShiftDTO>>("/shifts/open", dto, NO_TIMEOUT)
        .then((r) => r.data.data!),
    onSuccessCallback: (shift) => {
      queryClient.setQueryData<ShiftDTO | null>(QUERY_KEYS.SHIFT_ACTIVE, shift);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SHIFTS });
      invalidateShiftScoped(queryClient);
    },
  });
};

// GET /shifts/active — `data: null` si no hay turno abierto (ya no responde 404).
export const useActiveShift = (enabled: boolean = true) => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.SHIFT_ACTIVE,
    // Sin conexión se usa la última copia guardada: si ya había un turno
    // abierto, el POS puede seguir vendiendo offline.
    queryFn: () =>
      httpClient
        .get<ApiResponse<ShiftDTO | null>>("/shifts/active")
        .then((r) => r.data.data ?? null)
        .catch((error) =>
          fallbackWhenOffline(
            error,
            offlineCache.readActiveShift<ShiftDTO | null>(),
          ),
        ),
    enabled,
    staleTime: 60 * 1000,
    retry: false,
    roles: [RoleEnum.CASHIER, RoleEnum.ADMIN],
  });

  const data = useMemo(
    () => (handler.data ? mapShiftDTOToModel(handler.data) : null),
    [handler.data],
  );

  const isOpen = data?.status === ShiftStatusEnum.OPEN;

  return { ...handler, data, isOpen };
};

// GET /shifts/active/summary — cierre ciego: expectedCash siempre null.
export const useActiveShiftSummary = (enabled: boolean = true) => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.SHIFT_ACTIVE_SUMMARY,
    queryFn: () =>
      httpClient
        .get<ApiResponse<ShiftSummaryDTO>>("/shifts/active/summary")
        .then((r) => r.data.data!),
    enabled,
    staleTime: 0,
    retry: false,
    roles: [RoleEnum.CASHIER],
  });

  const data = useMemo(
    () => (handler.data ? mapShiftSummaryDTOToModel(handler.data) : null),
    [handler.data],
  );

  return { ...handler, data };
};

// POST /shifts/close — el turno queda PENDING (espera aprobación del admin).
// Devuelve el turno (ya no ciego: los montos quedaron fijos) y su comprobante.
export const useCloseShift = () => {
  const queryClient = useQueryClient();

  return usePostHandler({
    mutationFn: (dto: ShiftCloseDTO) =>
      httpClient
        .post<ApiResponse<ShiftCloseResponseDTO>>(
          "/shifts/close",
          dto,
          NO_TIMEOUT,
        )
        .then((r) => {
          const { receipt, ...shift } = r.data.data!;
          return { shift: mapShiftDTOToModel(shift), receipt };
        }),
    successMessage: "Turno cerrado; queda pendiente de aprobación",
    onSuccessCallback: () => {
      queryClient.setQueryData(QUERY_KEYS.SHIFT_ACTIVE, null);
      queryClient.removeQueries({ queryKey: QUERY_KEYS.SHIFT_ACTIVE_SUMMARY });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SHIFTS });
      invalidateShiftScoped(queryClient);
    },
  });
};

// ─── Admin / Manager ──────────────────────────────────────────────────────────

interface UseShiftsPageParams {
  page: number;
  status?: string;
  cashierId?: string;
  /** Solo MANAGER: al ADMIN el backend le fuerza su sucursal. */
  locationId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// GET /shifts/page — historial y bandeja de aprobación (status=PENDING).
export function useShiftsPage({
  page,
  status,
  cashierId,
  locationId,
  dateFrom,
  dateTo,
}: UseShiftsPageParams) {
  const params = {
    page,
    limit: DATA_TABLE.SHIFTS.limit ?? 10,
    ...(status && { status }),
    ...(cashierId && { cashierId }),
    ...(locationId && { locationId }),
    ...toUtcDateRangeParams(dateFrom, dateTo),
  };

  return usePaginatedGetHandler<
    ShiftDTO,
    ReturnType<typeof mapShiftDTOToModel>
  >({
    queryKey: QUERY_KEYS.PAGINATION_SHIFTS(params),
    queryFn: () =>
      httpClient
        .get<ApiResponse<ShiftDTO[]>>("/shifts/page", { params })
        .then((r) => r.data),
    select: mapShiftDTOToModel,
    params,
    staleTime: 0,
    roles: [RoleEnum.ADMIN, RoleEnum.MANAGER],
  });
}

// GET /shifts/:id
export function useShiftById(id: string | null) {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.SHIFT(id ?? ""),
    queryFn: () =>
      httpClient
        .get<ApiResponse<ShiftDTO>>(`/shifts/${id}`)
        .then((r) => r.data.data!),
    enabled: !!id,
    staleTime: 0,
    roles: [RoleEnum.ADMIN, RoleEnum.MANAGER],
  });

  const data = useMemo(
    () => (handler.data ? mapShiftDTOToModel(handler.data) : null),
    [handler.data],
  );

  return { ...handler, data };
}

// GET /shifts/:id/summary — con expectedCash calculado.
export function useShiftSummaryById(id: string | null) {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.SHIFT_SUMMARY(id ?? ""),
    queryFn: () =>
      httpClient
        .get<ApiResponse<ShiftSummaryDTO>>(`/shifts/${id}/summary`)
        .then((r) => r.data.data!),
    enabled: !!id,
    staleTime: 0,
    roles: [RoleEnum.ADMIN, RoleEnum.MANAGER],
  });

  const data = useMemo(
    () => (handler.data ? mapShiftSummaryDTOToModel(handler.data) : null),
    [handler.data],
  );

  return { ...handler, data };
}

// GET /shifts/:id/receipt — reimpresión del comprobante. CASHIER (solo sus
// turnos), ADMIN (su sucursal), MANAGER (todos). 409 SHIFT_NOT_CLOSED si sigue
// abierto. Tras la aprobación trae status CLOSED y review.
// Se pide bajo demanda (al pulsar "Imprimir"), siempre fresco.
export function useFetchShiftReceipt() {
  const queryClient = useQueryClient();

  return (id: string) =>
    queryClient.fetchQuery({
      queryKey: QUERY_KEYS.SHIFT_RECEIPT(id),
      queryFn: () =>
        httpClient
          .get<ApiResponse<ShiftReceiptDTO>>(`/shifts/${id}/receipt`)
          .then((r) => r.data.data!),
      staleTime: 0,
      retry: false,
    });
}

// POST /shifts/:id/approve — PENDING → CLOSED. Solo ADMIN.
export function useApproveShift() {
  return usePostHandler({
    mutationFn: ({ id, dto }: { id: string; dto: ShiftApproveDTO }) =>
      httpClient
        .post<ApiResponse<ShiftDTO>>(`/shifts/${id}/approve`, dto)
        .then((r) => mapShiftDTOToModel(r.data.data!)),
    successMessage: "Cierre aprobado",
    invalidateKeys: [QUERY_KEYS.SHIFTS],
  });
}
