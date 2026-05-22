import { QUERY_KEYS } from "@/constants";
import { useGetHandler } from "@/hooks/api.handlers";
import { httpClient } from "@/services/http.client";
import { ApiResponse } from "@/types/api.types";
import {
  CategoryDTO,
  MenuCategoryDTO,
} from "../../catalog/categories/dto/cateogory.dto";
import { useMemo } from "react";
import {
  mapCategoryDTOToModel,
  mapMenuCategoryDTOToModel,
} from "../../catalog/categories/mappers/category.mapper";

export const useCategoriesHandler = (enabled: boolean = true) => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.CATEGORIES,
    queryFn: () =>
      httpClient
        .get<ApiResponse<CategoryDTO[]>>("/categories")
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
    queryFn: () =>
      httpClient
        .get<ApiResponse<MenuCategoryDTO[]>>("/products/menu")
        .then((r) => r.data.data!),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const data = useMemo(
    () => (handler.data ? handler.data.map(mapMenuCategoryDTOToModel) : null),
    [handler.data],
  );

  return { ...handler, data };
};
