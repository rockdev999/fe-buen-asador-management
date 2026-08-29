import { QUERY_KEYS } from "@/constants";
import { useGetHandler } from "@/hooks/api.handlers";
import { httpClient } from "@/services/http.client";
import { LocationWithRoleDTO } from "@/features/locations/dto/location.dto";
import { mapLocationWithRoleDTOToModel } from "@/features/locations/mappers/location.mapper";
import { useMemo } from "react";

export function useMyLocations(enabled: boolean = true) {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.MY_LOCATIONS,
    queryFn: () =>
      httpClient
        .get<LocationWithRoleDTO[]>("/auth/my-locations")
        .then((r) => r.data),
    enabled,
    staleTime: 0,
    retry: false,
  });

  const data = useMemo(
    () => handler.data?.map(mapLocationWithRoleDTOToModel) ?? [],
    [handler.data],
  );

  return { ...handler, data };
}
