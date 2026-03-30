import { useAuthStore } from "@/stores/auth.store";
import { useNavigate } from "react-router-dom";
import { mapUserDetailsDTOToModel } from "@/features/users/mappers/user.mapper";
import { RoleEnum } from "@/constants";
import { PATHS } from "@/routes";
import { usePostHandler } from "@/hooks/api.handlers";
import { httpClient } from "@/services/http.client";

export function useSelectLocation() {
  const { setFullAuth } = useAuthStore();
  const navigate = useNavigate();

  return usePostHandler({
    mutationFn: (locationId: string) =>
      httpClient
        .post("/auth/select-location", { locationId })
        .then((r) => r.data),

    onSuccessCallback: (data) => {
      const user = mapUserDetailsDTOToModel(data.user);
      setFullAuth(user, data.accessToken);

      switch (user.role) {
        case RoleEnum.CASHIER:
          navigate(PATHS.POS, { replace: true });
          break;
        case RoleEnum.MANAGER:
        case RoleEnum.ADMIN:
        default:
          navigate(PATHS.DASHBOARD, { replace: true });
          break;
      }
    },
  });
}
