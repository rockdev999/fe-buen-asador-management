import { usePostHandler } from "@/hooks/api.handlers";
import { CreateSaleDTO, SaleDTO } from "../dto/sale.dto";
import { ApiResponse } from "@/types/api.types";
import { QUERY_KEYS } from "@/constants";
import { httpClient } from "@/services/http.client";
import { useMemo } from "react";
import { mapSaleDTOtoModel } from "../mappers/sale.mapper";

export const useCreateSale = () => {
  const handler = usePostHandler({
    mutationFn: (dto: CreateSaleDTO) =>
      httpClient
        .post<ApiResponse<SaleDTO>>("/sales", dto)
        .then((r) => r.data.data!),

    invalidateKeys: [QUERY_KEYS.SALES],
  });

  const data = useMemo(
    () => (handler.data ? mapSaleDTOtoModel(handler.data) : null),
    [handler.data],
  );

  return { ...handler, data };
};
