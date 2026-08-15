import { QUERY_KEYS } from "@/constants";
import {
  useDeleteHandler,
  useGetHandler,
  usePostHandler,
  usePutHandler,
} from "@/hooks/api.handlers";
import { httpClient } from "@/services/http.client";
import { ApiResponse } from "@/types/api.types";
import { useMemo } from "react";
import { mapRecipeDTOToModel } from "../mappers/recipe.mapper";
import { CreateRecipeDTO, RecipeDTO, UpdateRecipeDTO } from "../dto/recipe.dto";

export const useRecipesHandler = (enabled: boolean = true) => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.RECIPES,
    queryFn: () =>
      httpClient
        .get<ApiResponse<RecipeDTO[]>>("/ingredients/recipes/all")
        .then((r) => r.data.data!),
    enabled,
    staleTime: 0, // no caching, recipes drive stock consumption
  });

  const data = useMemo(
    () => (handler.data ? handler.data.map(mapRecipeDTOToModel) : null),
    [handler.data],
  );

  return { ...handler, data };
};

export const useRecipesByProductHandler = (
  productId: string | null,
  options?: { enabled?: boolean },
) => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.RECIPES_BY_PRODUCT(productId ?? ""),
    queryFn: () =>
      httpClient
        .get<
          ApiResponse<RecipeDTO[]>
        >(`/ingredients/recipes/product/${productId}`)
        .then((r) => r.data.data!),
    enabled: !!productId && (options?.enabled ?? true),
    staleTime: 0,
  });

  const data = useMemo(
    () => (handler.data ? handler.data.map(mapRecipeDTOToModel) : null),
    [handler.data],
  );

  return { ...handler, data };
};

export const useCreateRecipe = () => {
  const handler = usePostHandler({
    mutationFn: (dto: CreateRecipeDTO) =>
      // El backend crea una fila de receta por cada insumo enviado y
      // devuelve el array completo (una por ingrediente creado).
      httpClient
        .post<ApiResponse<RecipeDTO[]>>("/ingredients/recipes", dto)
        .then((r) => r.data.data!),
    // El listado de recetas se refresca manualmente con refetch() desde
    // quien llama. Sí invalidamos el stock de insumos: crear una receta
    // también genera el IngredientStock en 0 en las sucursales donde el
    // producto ya esté habilitado, y esa tabla no se refetchea manualmente
    // desde aquí.
    invalidateKeys: [["ingredients", "stock"]],
    successMessage: "Receta creada exitosamente",
  });

  return { ...handler };
};

export const useUpdateRecipe = (id: string) => {
  const handler = usePutHandler({
    mutationFn: (dto: UpdateRecipeDTO) =>
      httpClient
        .put<ApiResponse<RecipeDTO>>(`/ingredients/recipes/${id}`, dto)
        .then((r) => r.data.data!),
    // El listado de recetas se refresca manualmente con refetch() desde
    // quien llama — invalidarlo aquí duplicaría la petición.
    invalidateKeys: [],
    successMessage: "Receta actualizada exitosamente",
  });

  return { ...handler };
};

export const useDeleteRecipe = (id: string) => {
  const handler = useDeleteHandler({
    mutationFn: () =>
      httpClient.delete<void>(`/ingredients/recipes/${id}`).then(() => null),
    // El listado de recetas se refresca manualmente con refetch(); el stock
    // de insumos sí se invalida porque nada más lo refetchea.
    invalidateKeys: [["ingredients", "stock"]],
    successMessage: "Receta eliminada exitosamente",
  });

  return { ...handler };
};
