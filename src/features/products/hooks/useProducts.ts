import { QUERY_KEYS } from "@/constants";
import { useGetHandler } from "@/hooks/api.handlers";
import { httpClient } from "@/services/http.client";
import { ApiResponse } from "@/types/api.types";
import { ProductDTO } from "../dto/product.dto";
import { useMemo } from "react";
import { mapProductDTOToModel } from "../mappers/product.mapper";

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
