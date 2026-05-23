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
  mapProductDTOToModel,
  mapProductPageItemDTOToModel,
} from "../mappers/product.mapper";
import {
  CreateProductDTO,
  ProductDTO,
  ProductPageItemDTO,
} from "../dto/product.dto";
import { SortDirectionEnum } from "@/constants/enums/sort.enum";

interface UseProductsPageParams {
  page: number;
  search?: string;
  locationId?: string;
  categoryId?: string;
  available?: string;
  sortKey?: string;
  sortDir?: SortDirectionEnum | null;
}

export function useProductsPage({
  page,
  search,
  locationId,
  categoryId,
  available,
  sortKey,
  sortDir,
}: UseProductsPageParams) {
  const params = {
    page,
    limit: DATA_TABLE.PRODUCTS.limit ?? 10,
    ...(search && { search }),
    ...(locationId && { locationId }),
    ...(categoryId && { categoryId }),
    ...(available && { available }),
    ...(sortKey && { sortBy: sortKey }),
    ...(sortDir && { sortOrder: sortDir.toUpperCase() }),
  };

  return usePaginatedGetHandler<
    ProductPageItemDTO,
    ReturnType<typeof mapProductPageItemDTOToModel>
  >({
    queryKey: QUERY_KEYS.PAGINATION_PRODUCTS(params),
    queryFn: () =>
      httpClient
        .get<ApiResponse<ProductPageItemDTO[]>>("/products/page", { params })
        .then((r) => r.data),
    select: mapProductPageItemDTOToModel,
    params,
    enabled: true,
    staleTime: 0, // always fetch fresh data for pagination
  });
}

export const useProductsHandler = (enabled: boolean = true) => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.PRODUCTS,
    queryFn: () =>
      httpClient
        .get<
          ApiResponse<ProductDTO[]>
        >("/products", { params: { available: true } })
        .then((r) => r.data.data!),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const data = useMemo(
    () => handler.data?.map(mapProductDTOToModel) ?? null,
    [handler.data],
  );

  return { ...handler, data };
};

export const useGetProductById = (
  id: string | null,
  options?: { enabled?: boolean },
) => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.PRODUCT(id ?? ""),
    queryFn: () =>
      httpClient
        .get<ApiResponse<ProductDTO>>(`/products/${id}`)
        .then((r) => r.data.data!),
    enabled: !!id && (options?.enabled ?? true),
    staleTime: 0, // no caching, always fetch fresh data
  });

  const data = useMemo(
    () => (handler.data ? mapProductDTOToModel(handler.data) : null),
    [handler.data],
  );

  return { ...handler, data };
};

export const useCreateProduct = () => {
  const handler = usePostHandler({
    mutationFn: (formData: FormData) =>
      httpClient
        .post<ApiResponse<CreateProductDTO>>("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data.data!),

    invalidateKeys: [],
    successMessage: "Producto creado exitosamente",
  });

  return { ...handler };
};

export const useUpdateProduct = (id: string) => {
  const handler = usePutHandler({
    mutationFn: (formData: FormData) =>
      httpClient
        .put<ApiResponse<CreateProductDTO>>(`/products/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data.data!),

    invalidateKeys: [],
    successMessage: "Producto actualizado exitosamente",
  });

  return { ...handler };
};

export const useDeleteProduct = (id: string) => {
  const handler = useDeleteHandler({
    mutationFn: () =>
      httpClient
        .delete<ApiResponse<null>>(`/products/${id}/delete`)
        .then((r) => r.data),

    invalidateKeys: [],
    successMessage: "Producto eliminado exitosamente",
  });

  return { ...handler };
};
