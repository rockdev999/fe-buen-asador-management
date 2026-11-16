import { QUERY_KEYS } from "@/constants";
import {
  useDeleteHandler,
  useGetHandler,
  usePatchHandler,
  usePostHandler,
  usePutHandler,
} from "@/hooks/api.handlers";
import { toast } from "sonner";
import { httpClient } from "@/services/http.client";
import { ApiErrorResponse, ApiResponse } from "@/types/api.types";
import {
  CategoryAvailabilityResponseDTO,
  CategoryDTO,
  CategoryShortDTO,
  CreateCategoryDTO,
  MenuCategoryDTO,
} from "../dto/cateogory.dto";
import { useMemo } from "react";
import {
  fallbackWhenOffline,
  offlineCache,
} from "@/features/offline/services/offline-cache";
import {
  mapCategoryDTOToModel,
  mapCategorySimpleDTOToModel,
  mapMenuCategoryDTOToModel,
} from "../mappers/category.mapper";

/**
 * @param locationId alcance de los conteos (productsCount /
 *   availableProductsCount). MANAGER: la sucursal del filtro o null (todas).
 *   ADMIN/CASHIER: el backend usa siempre la del token.
 */
export const useCategoriesHandler = (
  locationId: string | null = null,
  enabled: boolean = true,
) => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.CATEGORIES_LIST(locationId),
    queryFn: () =>
      httpClient
        .get<ApiResponse<CategoryDTO[]>>("/categories", {
          params: locationId ? { locationId } : {},
        })
        .then((r) => r.data.data!),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const data = useMemo(
    () => (handler.data ? handler.data.map(mapCategoryDTOToModel) : null),
    [handler.data],
  );

  return { ...handler, data };
};

export const useGetMenuHandler = (enabled: boolean = true) => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.MENU,
    // Sin conexión se usa la última copia guardada, para vender offline.
    queryFn: () =>
      httpClient
        .get<ApiResponse<MenuCategoryDTO[]>>("/products/menu")
        .then((r) => r.data.data!)
        .catch((error) =>
          fallbackWhenOffline(
            error,
            offlineCache.readMenu<MenuCategoryDTO[]>(),
          ),
        ),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const data = useMemo(
    () => (handler.data ? handler.data.map(mapMenuCategoryDTOToModel) : null),
    [handler.data],
  );

  return { ...handler, data };
};

export const useCategoriesSimpleHandler = (enabled: boolean = true) => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.CATEGORIES_SIMPLE,
    queryFn: () =>
      httpClient
        .get<
          ApiResponse<CategoryShortDTO[]>
        >("/categories/simple", { params: { available: true } })
        .then((r) => r.data.data!),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const data = useMemo(
    () => handler.data?.map(mapCategorySimpleDTOToModel) ?? null,
    [handler.data],
  );

  return { ...handler, data };
};

interface CategoryMutationOptions {
  onErrorCallback?: (error: ApiErrorResponse) => void;
}

export const useCreateCategory = (options?: CategoryMutationOptions) => {
  const handler = usePostHandler({
    mutationFn: (dto: CreateCategoryDTO) =>
      httpClient
        .post<ApiResponse<CreateCategoryDTO>>("/categories", dto)
        .then((r) => r.data.data!),

    invalidateKeys: [],
    successMessage: "Categoría creada exitosamente",
    onErrorCallback: options?.onErrorCallback,
  });

  return { ...handler };
};

export const useUpdateCategory = (
  categoryId: string,
  options?: CategoryMutationOptions,
) => {
  const handler = usePutHandler({
    mutationFn: (dto: CreateCategoryDTO) =>
      httpClient
        .put<ApiResponse<CreateCategoryDTO>>(`/categories/${categoryId}`, dto)
        .then((r) => r.data.data!),

    invalidateKeys: [],
    successMessage: "Categoría actualizada exitosamente",
    onErrorCallback: options?.onErrorCallback,
  });

  return { ...handler };
};

export const useDeleteCategory = (categoryId: string) => {
  const handler = useDeleteHandler({
    mutationFn: () =>
      httpClient
        .delete<ApiResponse<null>>(`/categories/${categoryId}`)
        .then((r) => r.data.data!),

    invalidateKeys: [],
    successMessage: "Categoría eliminada exitosamente",
  });

  return { ...handler };
};

/**
 * PATCH /categories/:id/availability[?locationId] — prende/apaga todos los
 * productos de la categoría en la sucursal indicada (o en todas, sin
 * locationId). ADMIN no envía locationId: el backend usa el del token.
 */
export const useUpdateCategoryAvailability = () =>
  usePatchHandler({
    mutationFn: ({
      id,
      available,
      locationId,
    }: {
      id: string;
      available: boolean;
      locationId?: string | null;
    }) =>
      httpClient
        .patch<ApiResponse<CategoryAvailabilityResponseDTO>>(
          `/categories/${id}/availability`,
          { available },
          { params: locationId ? { locationId } : {} },
        )
        .then((r) => r.data),
    retry: false,
    // Conteos de categorías, disponibilidad en la tabla de productos y menú POS.
    invalidateKeys: [QUERY_KEYS.CATEGORIES, QUERY_KEYS.PRODUCTS, QUERY_KEYS.MENU],
    onSuccessCallback: (response) => {
      // "Se desactivaron 5 productos en Casa Matriz", etc.
      toast.success(response.message ?? "Disponibilidad actualizada");
    },
  });
