import { useMutationHandler } from "@/hooks/useMutationStatus";
import { useAuthStore } from "@/stores/auth.store";
import { authFetch } from "../api/auth.service";
import { UserDetails } from "@/features/users/models/user.model";
import { mapAuthUserDTOToModel } from "../mappers/login.mapper";

export function useSelectLocation() {
  const { setFullAuth } = useAuthStore();

  return useMutationHandler({
    mutationFn: (locationId: string) =>
      authFetch.selectLocation({ locationId }),
    onSuccessCallback: (data) => {
      const user: UserDetails = mapAuthUserDTOToModel(data);
      setFullAuth(user, data.accessToken);
    },
  });
}
