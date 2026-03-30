import { useGetHandler, usePostHandler } from "@/hooks/api.handlers";
import { ShiftDTO, ShiftOpenDTO } from "../dto/shift.dto";
import { httpClient } from "@/services/http.client";
import { mapShiftDTOToModel } from "../mappers/shift.mapper";
import { QUERY_KEYS } from "@/constants";
import { ApiResponse } from "@/types/api.types";
import { useEffect, useMemo } from "react";
import { useCashierStore } from "../stores/cashier.store";

export const useOpenShiftHandler = () => {
  const { setActiveShift } = useCashierStore();

  return usePostHandler({
    mutationFn: (dto: ShiftOpenDTO) =>
      httpClient.post("/shifts/open", dto).then((r) => r.data),

    onSuccessCallback: (data) => {
      const shift = mapShiftDTOToModel(data);
      setActiveShift(shift);
      return shift;
    },
  });
};

export const useActiveShift = (enabled: boolean = true) => {
  const { setActiveShift } = useCashierStore();

  const handler = useGetHandler({
    queryKey: QUERY_KEYS.SHIFT_ACTIVE,
    queryFn: () =>
      httpClient
        .get<ApiResponse<ShiftDTO>>("/shifts/active")
        .then((r) => r.data),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false,
  });

  const data = useMemo(
    () => (handler.data?.data ? mapShiftDTOToModel(handler.data.data) : null),
    [handler.data],
  );

  const isOpen = !!data?.openedAt && !data?.closedAt;

  useEffect(() => {
    if (handler.status === "success") {
      setActiveShift(data);
    }
  }, [handler.status, data]);

  return { ...handler, data, isOpen };
};
