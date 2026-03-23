import { useMutationHandler } from "@/hooks/useMutationStatus";
import { useAuthStore } from "@/stores/auth.store";
import { authFetch } from "../api/auth.service";
import { LoginForm } from "../forms/login.form";
import { mapLoginFormToDTO } from "../mappers/login.mapper";
import { mapLocationDTOToModel } from "@/features/locations/mappers/location.mapper";

export function useLogin() {
  const { setTempAuth } = useAuthStore();

  return useMutationHandler({
    mutationFn: (form: LoginForm) => authFetch.login(mapLoginFormToDTO(form)),
    onSuccessCallback: (data) =>
      setTempAuth(
        data.temporaryToken,
        data.locations.map(mapLocationDTOToModel),
      ),
  });
}
