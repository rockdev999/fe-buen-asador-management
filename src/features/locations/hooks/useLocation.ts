import { DATA_TABLE, QUERY_KEYS } from "@/constants";
import {
  useGetHandler,
  usePaginatedGetHandler,
  usePatchHandler,
  usePostHandler,
  usePutHandler,
} from "@/hooks/api.handlers";
import { httpClient } from "@/services/http.client";
import { ApiResponse } from "@/types/api.types";
import {
  CreateLocationDTO,
  LocationDetailDTO,
  LocationPageItemDTO,
  LocationSimpleDTO,
} from "../dto/location.dto";
import { useMemo } from "react";
import {
  mapLocationPageItemDTOToModel,
  mapLocationsDetailDTOToModel,
  mapLocationSimpleDTOToModel,
} from "../mappers/location.mapper";
import { SortDirectionEnum } from "@/constants/enums/sort.enum";

interface UseSalesPageParams {
  page: number;
  search?: string;
  name?: string;
  active?: boolean;
  sortKey?: string;
  sortDir?: SortDirectionEnum | null;
}

export function useLocationsPage({
  page,
  search,
  name,
  active,
  sortKey,
  sortDir,
}: UseSalesPageParams) {
  const params = {
    page,
    limit: DATA_TABLE.SALES.limit ?? 10,
    ...(search && { search }),
    ...(name && { name }),
    ...(active !== undefined && { active }),
    ...(sortKey && { sortBy: sortKey }),
    ...(sortDir && { sortOrder: sortDir.toUpperCase() }),
  };

  return usePaginatedGetHandler<
    LocationPageItemDTO,
    ReturnType<typeof mapLocationPageItemDTOToModel>
  >({
    queryKey: QUERY_KEYS.PAGINATION_LOCATIONS(params),
    queryFn: () =>
      httpClient
        .get<ApiResponse<LocationPageItemDTO[]>>("/locations/page", { params })
        .then((r) => r.data),
    select: mapLocationPageItemDTOToModel,
    params,
    enabled: true,
    staleTime: 0, // always fetch fresh data for pagination
  });
}

export const useGetLocationSimple = () => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.LOCATION_SIMPLE,
    queryFn: () =>
      httpClient
        .get<ApiResponse<LocationSimpleDTO[]>>("/locations/simple")
        .then((r) => r.data.data!),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const data = useMemo(
    () => (handler.data ? handler.data.map(mapLocationSimpleDTOToModel) : null),
    [handler.data],
  );

  return { ...handler, data };
};

export const useCreateLocation = () => {
  const handler = usePostHandler({
    mutationFn: (dto: CreateLocationDTO) =>
      httpClient
        .post<ApiResponse<CreateLocationDTO>>("/locations", dto)
        .then((r) => r.data.data!),

    invalidateKeys: [],
    successMessage: "Sucursal creada exitosamente",
  });

  return { ...handler };
};

export const useUpdateLocation = (id: string) => {
  const handler = usePutHandler({
    mutationFn: (dto: CreateLocationDTO) =>
      httpClient
        .put<ApiResponse<CreateLocationDTO>>(`/locations/${id}`, dto)
        .then((r) => r.data.data!),

    invalidateKeys: [QUERY_KEYS.LOCATIONS],
    successMessage: "Sucursal actualizada exitosamente",
  });

  return { ...handler };
};

export const useActivateLocation = (id: string) => {
  const handler = usePatchHandler({
    mutationFn: () =>
      httpClient
        .patch<ApiResponse<null>>(`/locations/${id}/activate`, {})
        .then((r) => r.data),

    invalidateKeys: [],
    successMessage: "Sucursal activada exitosamente",
  });

  return { ...handler };
};

export const useDeactivateLocation = (id: string) => {
  const handler = usePatchHandler({
    mutationFn: () =>
      httpClient
        .patch<ApiResponse<null>>(`/locations/${id}/deactivate`, {})
        .then((r) => r.data),

    invalidateKeys: [],
    successMessage: "Sucursal desactivada exitosamente",
  });

  return { ...handler };
};

export const useGetLocation = (
  id: string | null,
  options?: { enabled?: boolean },
) => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.LOCATION(id ?? ""),
    queryFn: () =>
      httpClient
        .get<ApiResponse<LocationDetailDTO>>(`/locations/${id}`)
        .then((r) => r.data.data!),
    enabled: !!id && (options?.enabled ?? true),
    staleTime: 0, // no caching, always fetch fresh data
  });

  const data = useMemo(
    () => (handler.data ? mapLocationsDetailDTOToModel(handler.data) : null),
    [handler.data],
  );

  return { ...handler, data };
};

export const useAssignUsersToLocation = () => {
  return usePostHandler({
    mutationFn: ({
      locationId,
      dto,
    }: {
      locationId: string;
      dto: { users: { userId: string; roleId: string }[] };
    }) =>
      httpClient
        .post<ApiResponse<null>>(`/locations/${locationId}/users`, dto)
        .then((r) => r.data.data!),
    invalidateKeys: [],
    successMessage: "Usuarios asignados correctamente",
  });
};

export const useDeactivateUserByLocation = () => {
  return usePatchHandler({
    mutationFn: ({
      locationId,
      userId,
    }: {
      locationId: string;
      userId: string;
    }) =>
      httpClient
        .patch<
          ApiResponse<LocationDetailDTO>
        >(`/locations/${locationId}/users/${userId}`)
        .then((r) => r.data.data!),
    invalidateKeys: [],
    successMessage: "Usuario removido de la sucursal",
  });
};
