import { QUERY_KEYS } from "@/constants";
import {
  useDeleteHandler,
  useGetHandler,
  usePostHandler,
  usePutHandler,
} from "@/hooks/api.handlers";
import { httpClient } from "@/services/http.client";
import { ApiResponse } from "@/types/api.types";
import { CreateModifierDTO, ModifierDTO } from "../dto/modifier.dto";
import { useMemo } from "react";
import { mapModifierDTOToModel } from "@/features/catalog/modifiers/mappers/modifier.mapper";

export const useModifiersHandler = (enabled: boolean = true) => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.MODIFIERS,
    queryFn: () =>
      httpClient
        .get<ApiResponse<ModifierDTO[]>>("/modifiers")
        .then((r) => r.data),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const data = useMemo(
    () => handler.data?.data?.map(mapModifierDTOToModel) ?? null,
    [handler.data],
  );

  return { ...handler, data };
};

export const useCreateModifier = () => {
  const handler = usePostHandler({
    mutationFn: (dto: CreateModifierDTO) =>
      httpClient
        .post<ApiResponse<CreateModifierDTO>>("/modifiers", dto)
        .then((r) => r.data.data!),

    invalidateKeys: [],
    successMessage: "Modificador creado exitosamente",
  });

  return { ...handler };
};

export const useUpdateModifier = (modifierId: string) => {
  const handler = usePutHandler({
    mutationFn: (dto: CreateModifierDTO) =>
      httpClient
        .put<ApiResponse<CreateModifierDTO>>(`/modifiers/${modifierId}`, dto)
        .then((r) => r.data.data!),

    invalidateKeys: [],
    successMessage: "Modificador actualizado exitosamente",
  });

  return { ...handler };
};

export const useDeleteModifier = (modifierId: string) => {
  const handler = useDeleteHandler({
    mutationFn: () =>
      httpClient
        .delete<ApiResponse<null>>(`/modifiers/${modifierId}`)
        .then((r) => r.data.data!),

    invalidateKeys: [],
    successMessage: "Modificador eliminado exitosamente",
  });

  return { ...handler };
};
