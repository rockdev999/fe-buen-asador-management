import { QUERY_KEYS } from "@/constants";
import { useGetHandler } from "@/hooks/api.handlers";
import { httpClient } from "@/services/http.client";
import { ApiResponse } from "@/types/api.types";
import { LocationSimpleDTO } from "../dto/location.dto";
import { useMemo } from "react";
import { mapLocationSimpleDTOToModel } from "../mappers/location.mapper";

export const useGetLocationSimple = () => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.LOCATION_SIMPLE,
    queryFn: () =>
      httpClient
        .get<ApiResponse<LocationSimpleDTO[]>>("/locations/simple")
        .then((r) => r.data.data!),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const data = useMemo(
    () => (handler.data ? handler.data.map(mapLocationSimpleDTOToModel) : null),
    [handler.data],
  );

  return { ...handler, data };
};
