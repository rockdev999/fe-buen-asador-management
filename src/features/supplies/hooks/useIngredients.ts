import { DATA_TABLE, QUERY_KEYS } from "@/constants";
import {
  useDeleteHandler,
  useGetHandler,
  usePaginatedGetHandler,
  usePostHandler,
  usePutHandler,
} from "@/hooks/api.handlers";
import { httpClient } from "@/services/http.client";
import { ApiResponse } from "@/types/api.types";
import { useMemo } from "react";
import {
  mapIngredientDTOToModel,
  mapIngredientListItemDTOToModel,
  mapIngredientSimpleDTOToModel,
} from "../mappers/ingredient.mapper";
import {
  CreateIngredientDTO,
  IngredientDTO,
  IngredientListItemDTO,
  IngredientSimpleDTO,
  UpdateIngredientDTO,
} from "../dto/ingredient.dto";

interface UseIngredientsPageParams {
  page: number;
  search?: string;
}

export function useIngredientsPage({ page, search }: UseIngredientsPageParams) {
  // El backend de /ingredients solo acepta { search, page, limit } —
  // no soporta sortBy/sortOrder (400 "property should not exist").
  const params = {
    page,
    limit: DATA_TABLE.INGREDIENTS.limit ?? 10,
    ...(search && { search }),
  };

  return usePaginatedGetHandler<
    IngredientListItemDTO,
    ReturnType<typeof mapIngredientListItemDTOToModel>
  >({
    queryKey: QUERY_KEYS.PAGINATION_INGREDIENTS(params),
    queryFn: () =>
      httpClient
        .get<ApiResponse<IngredientListItemDTO[]>>("/ingredients", { params })
        .then((r) => r.data),
    select: mapIngredientListItemDTOToModel,
    params,
    enabled: true,
    staleTime: 0, // always fetch fresh data for pagination
  });
}

export const useIngredientsSimpleHandler = (enabled: boolean = true) => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.INGREDIENTS_SIMPLE,
    queryFn: () =>
      httpClient
        .get<ApiResponse<IngredientSimpleDTO[]>>("/ingredients/simple")
        .then((r) => r.data.data!),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const data = useMemo(
    () => (handler.data ? handler.data.map(mapIngredientSimpleDTOToModel) : null),
    [handler.data],
  );

  return { ...handler, data };
};

export const useGetIngredientById = (
  id: string | null,
  options?: { enabled?: boolean },
) => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.INGREDIENT(id ?? ""),
    queryFn: () =>
      httpClient
        .get<ApiResponse<IngredientDTO>>(`/ingredients/${id}`)
        .then((r) => r.data.data!),
    enabled: !!id && (options?.enabled ?? true),
    staleTime: 0, // no caching, always fetch fresh data
  });

  const data = useMemo(
    () => (handler.data ? mapIngredientDTOToModel(handler.data) : null),
    [handler.data],
  );

  return { ...handler, data };
};

export const useCreateIngredient = () => {
  const handler = usePostHandler({
    mutationFn: (dto: CreateIngredientDTO) =>
      httpClient
        .post<ApiResponse<IngredientDTO>>("/ingredients", dto)
        .then((r) => r.data.data!),
    // El listado paginado se refresca manualmente con refetch() desde quien
    // llama. QUERY_KEYS.INGREDIENTS es prefijo de TODAS las claves de este
    // dominio (stock, kardex, alertas, recetas), así que invalidarlo aquí
    // duplicaría peticiones y refetchearía cosas sin relación.
    invalidateKeys: [],
    successMessage: "Insumo creado exitosamente",
  });

  return { ...handler };
};

export const useUpdateIngredient = (id: string) => {
  const handler = usePutHandler({
    mutationFn: (dto: UpdateIngredientDTO) =>
      httpClient
        .put<ApiResponse<IngredientDTO>>(`/ingredients/${id}`, dto)
        .then((r) => r.data.data!),
    // El listado paginado se refresca manualmente con refetch() desde quien
    // llama; sí invalidamos el detalle individual por si hay una vista
    // abierta con useGetIngredientById.
    invalidateKeys: [QUERY_KEYS.INGREDIENT(id)],
    successMessage: "Insumo actualizado exitosamente",
  });

  return { ...handler };
};

export const useDeleteIngredient = (id: string) => {
  const handler = useDeleteHandler({
    mutationFn: () =>
      httpClient
        .delete<void>(`/ingredients/${id}`)
        .then(() => null),
    // El listado paginado se refresca manualmente con refetch() desde quien
    // llama (ver nota en useCreateIngredient).
    invalidateKeys: [],
    successMessage: "Insumo eliminado exitosamente",
  });

  return { ...handler };
};
