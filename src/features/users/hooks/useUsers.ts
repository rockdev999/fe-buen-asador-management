import {
  useGetHandler,
  usePaginatedGetHandler,
  usePatchHandler,
  usePostHandler,
  usePutHandler,
} from "@/hooks/api.handlers";
import {
  CreateUserDTO,
  UserLocationsDTO,
  UserPageItemDTO,
} from "../dto/user.dto";
import {
  mapUserLocationsDTOToModel,
  mapUserPageItemDTOToModel,
} from "../mappers/user.mapper";
import { QUERY_KEYS, RoleEnum } from "@/constants";
import { httpClient } from "@/services/http.client";
import { ApiResponse } from "@/types/api.types";
import { SortDirectionEnum } from "@/constants/enums/sort.enum";
import { UserStatusEnum } from "@/constants/enums/user.enum";
import { useMemo } from "react";
import { UUID } from "@/types/common";
import { JobPositionEnum } from "@/constants/enums/job-position.enum";

interface UseUsersPageParams {
  page: number;
  search?: string;
  active?: UserStatusEnum | "";
  locationId?: string;
  role?: RoleEnum | "";
  positions?: JobPositionEnum | "";
  sortKey?: string;
  sortDir?: SortDirectionEnum | null;
}

export function useUsersPage({
  page,
  search,
  active,
  locationId,
  role,
  positions,
  sortKey,
  sortDir,
}: UseUsersPageParams) {
  const params = {
    page,
    limit: 10,
    ...(search && { search }),
    ...(active !== undefined && active !== "" && { active }),
    ...(locationId && { locationId }),
    ...(role && { role }),
    ...(positions && { positions }),
    ...(sortKey && { sortBy: sortKey }),
    ...(sortDir && { sortOrder: sortDir }),
  };

  return usePaginatedGetHandler<
    UserPageItemDTO,
    ReturnType<typeof mapUserPageItemDTOToModel>
  >({
    queryKey: QUERY_KEYS.PAGINATION_USERS(params),
    queryFn: () =>
      httpClient
        .get<ApiResponse<UserPageItemDTO[]>>("/users/page", { params })
        .then((r) => r.data),
    select: mapUserPageItemDTOToModel,
    params,
    enabled: true,
    staleTime: 5 * 10 * 1000, // 5 minutes
  });
}

export const useGetUserWithLocations = (
  id: string | null,
  options?: { enabled?: boolean },
) => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.USER(id ?? ""),
    queryFn: () =>
      httpClient
        .get<ApiResponse<UserLocationsDTO>>(`/users/${id}`)
        .then((r) => r.data.data!),
    enabled: !!id && (options?.enabled ?? true),
    staleTime: 0, // no caching, always fetch fresh data
  });

  const data = useMemo(
    () => (handler.data ? mapUserLocationsDTOToModel(handler.data) : null),
    [handler.data],
  );

  return { ...handler, data };
};

export const useCreateUser = () => {
  const handler = usePostHandler({
    mutationFn: (dto: CreateUserDTO) =>
      httpClient
        .post<ApiResponse<CreateUserDTO>>("/users", dto)
        .then((r) => r.data.data!),

    invalidateKeys: [QUERY_KEYS.USERS],
    successMessage: "Usuario creado exitosamente",
  });

  return { ...handler };
};

export const useUpdateUser = (id: UUID) => {
  const handler = usePutHandler({
    mutationFn: (dto: CreateUserDTO) =>
      httpClient
        .put<ApiResponse<CreateUserDTO>>(`/users/${id}`, dto)
        .then((r) => r.data.data!),

    invalidateKeys: [QUERY_KEYS.USERS],
    successMessage: "Usuario actualizado exitosamente",
  });

  return { ...handler };
};

export const useDeactivateUser = (id: UUID) => {
  const handler = usePatchHandler({
    mutationFn: () =>
      httpClient
        .patch<ApiResponse<null>>(`/users/${id}/deactivate`, {})
        .then((r) => r.data),

    invalidateKeys: [QUERY_KEYS.USERS],
    successMessage: "Usuario desactivado exitosamente",
  });

  return { ...handler };
};
