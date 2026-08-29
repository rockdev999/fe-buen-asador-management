import {
  useGetHandler,
  usePaginatedGetHandler,
  usePostHandler,
} from "@/hooks/api.handlers";
import {
  CreateSaleDTO,
  ManagerSalePageItemDTO,
  SaleDTO,
  SalePageItemDTO,
} from "../dto/sale.dto";
import { ApiResponse } from "@/types/api.types";
import { DATA_TABLE, QUERY_KEYS } from "@/constants";
import { httpClient } from "@/services/http.client";
import { useMemo } from "react";
import {
  mapManagerSalePageItemDTOToModel,
  mapSaleDTOtoModel,
  mapSalePageItemDTOToModel,
} from "../mappers/sale.mapper";
import { SortDirectionEnum } from "@/constants/enums/sort.enum";
import { useAuthStore } from "@/stores/auth.store";

interface UseSalesPageParams {
  page: number;
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  shiftId?: string;
  sortKey?: string;
  sortDir?: SortDirectionEnum | null;
}

export function useSalesPage({
  page,
  search,
  status,
  dateFrom,
  dateTo,
  shiftId,
  sortKey,
  sortDir,
}: UseSalesPageParams) {
  const locationId = useAuthStore((s) => s.user?.locationId);

  const params = {
    page,
    limit: DATA_TABLE.SALES.limit ?? 10,
    ...(search && { search }),
    ...(status && { status }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
    ...(shiftId && { shiftId }),
    ...(sortKey && { sortBy: sortKey }),
    ...(sortDir && { sortOrder: sortDir.toUpperCase() }),
  };

  return usePaginatedGetHandler<
    SalePageItemDTO,
    ReturnType<typeof mapSalePageItemDTOToModel>
  >({
    queryKey: QUERY_KEYS.PAGINATION_SALES(params),
    queryFn: () =>
      httpClient
        .get<
          ApiResponse<SalePageItemDTO[]>
        >(`/sales/${locationId}/page-by-location`, { params })
        .then((r) => r.data),
    select: mapSalePageItemDTOToModel,
    params,
    enabled: !!locationId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

interface UseManagerSalesPageParams {
  page: number;
  search?: string;
  status?: string;
  paymentMethod?: string;
  cashierId?: string;
  locationId?: string;
  dateFrom?: string;
  dateTo?: string;
  shiftId?: string;
  sortKey?: string;
  sortDir?: SortDirectionEnum | null;
}

// Vista global (todas las sucursales) exclusiva de MANAGER — /sales/page,
// a diferencia de /sales/:locationId/page-by-location que depende del
// locationId del token (null para MANAGER).
export function useManagerSalesPage({
  page,
  search,
  status,
  paymentMethod,
  cashierId,
  locationId,
  dateFrom,
  dateTo,
  shiftId,
  sortKey,
  sortDir,
}: UseManagerSalesPageParams) {
  const params = {
    page,
    limit: DATA_TABLE.SALES.limit ?? 10,
    ...(search && { search }),
    ...(status && { status }),
    ...(paymentMethod && { paymentMethod }),
    ...(cashierId && { cashierId }),
    ...(locationId && { locationId }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
    ...(shiftId && { shiftId }),
    ...(sortKey && { sortBy: sortKey }),
    ...(sortDir && { sortOrder: sortDir.toUpperCase() }),
  };

  return usePaginatedGetHandler<
    ManagerSalePageItemDTO,
    ReturnType<typeof mapManagerSalePageItemDTOToModel>
  >({
    queryKey: QUERY_KEYS.PAGINATION_SALES_MANAGER(params),
    queryFn: () =>
      httpClient
        .get<ApiResponse<ManagerSalePageItemDTO[]>>("/sales/page", {
          params,
        })
        .then((r) => r.data),
    select: mapManagerSalePageItemDTOToModel,
    params,
    enabled: true,
    staleTime: 0,
  });
}

export const useCreateSale = () => {
  const handler = usePostHandler({
    mutationFn: (dto: CreateSaleDTO) =>
      httpClient
        .post<ApiResponse<SaleDTO>>("/sales", dto)
        .then((r) => r.data.data!),

    invalidateKeys: [QUERY_KEYS.SALES],
  });

  const data = useMemo(
    () => (handler.data ? mapSaleDTOtoModel(handler.data) : null),
    [handler.data],
  );

  return { ...handler, data };
};

export const useGetSaleById = (id: string | null) => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.SALE(id ?? ""),
    queryFn: () =>
      httpClient
        .get<ApiResponse<SaleDTO>>(`/sales/${id}`)
        .then((r) => r.data.data!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const data = useMemo(
    () => (handler.data ? mapSaleDTOtoModel(handler.data) : null),
    [handler.data],
  );

  return { ...handler, data };
};
