import { QUERY_KEYS } from "@/constants";
import { useGetHandler } from "@/hooks/api.handlers";
import { httpClient } from "@/services/http.client";
import { ApiResponse } from "@/types/api.types";
import { ModifierDTO } from "../dto/modifier.dto";
import { useMemo } from "react";
import { mapModifierDTOToModel } from "../mappers/modifier.mapper";

export const useModifiers = (enabled: boolean = true) => {
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
