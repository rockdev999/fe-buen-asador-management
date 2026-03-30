import { QUERY_KEYS } from "@/constants";
import { useGetHandler } from "@/hooks/api.handlers";
import { httpClient } from "@/services/http.client";
import { ApiResponse } from "@/types/api.types";
import { ShiftDTO } from "../dto/shift.dto";
import { useMemo } from "react";
import { mapShiftDTOToModel } from "../mappers/shift.mapper";

export const useActiveShiftHandler = (enabled: boolean = true) => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.SHIFT_ACTIVE,
    queryFn: () =>
      httpClient
        .get<ApiResponse<ShiftDTO>>("/shifts/active")
        .then((r) => r.data.data!),
    enabled,
    staleTime: 0,
    retry: false,
  });

  const data = useMemo(
    () => (handler.data ? mapShiftDTOToModel(handler.data) : null),
    [handler.data],
  );

  return { ...handler, data };
};
