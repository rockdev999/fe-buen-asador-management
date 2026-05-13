import {
  useGetHandler,
  usePaginatedGetHandler,
  usePostHandler,
} from "@/hooks/api.handlers";
import { CreateSaleDTO, SaleDTO, SalePageItemDTO } from "../dto/sale.dto";
import { ApiResponse } from "@/types/api.types";
import { DATA_TABLE, QUERY_KEYS } from "@/constants";
import { httpClient } from "@/services/http.client";
import { useMemo } from "react";
import {
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
