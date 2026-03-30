import { useAuthStore } from "@/stores/auth.store";
import { LoginForm } from "../forms/login.form";
import { mapLoginFormToDTO } from "../mappers/login.mapper";
import { mapLocationDTOToModel } from "@/features/locations/mappers/location.mapper";
import { usePostHandler } from "@/hooks/api.handlers";
import { httpClient } from "@/services/http.client";
import { LoginLocationsDTO } from "../dto/login.dto";

export function useLogin() {
  const { setTempAuth } = useAuthStore();

  return usePostHandler({
    mutationFn: (form: LoginForm) =>
      httpClient
        .post<LoginLocationsDTO>("/auth/login", mapLoginFormToDTO(form))
        .then((r) => r.data),

    onSuccessCallback: (data) => {
      setTempAuth(
        data.temporaryToken,
        data.locations.map(mapLocationDTOToModel),
      );
    },
  });
}
