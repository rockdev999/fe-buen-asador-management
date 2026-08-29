import { useAuthStore } from "@/stores/auth.store";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { mapUserDetailsDTOToModel } from "@/features/users/mappers/user.mapper";
import { RoleEnum } from "@/constants";
import { PATHS } from "@/routes";
import { usePostHandler } from "@/hooks/api.handlers";
import { httpClient } from "@/services/http.client";
import { UUID } from "@/types/common";
import { useCashierStore } from "@/features/pos/stores/cashier.store";

export function useSelectLocation() {
  const { setFullAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return usePostHandler({
    mutationFn: (locationId: UUID | null) =>
      httpClient
        .post("/auth/select-location", { locationId })
        .then((r) => r.data),

    onSuccessCallback: (data) => {
      const user = mapUserDetailsDTOToModel(data.user);
      setFullAuth(user, data.accessToken);

      // Los datos en cache/turno pertenecen a la sucursal anterior.
      useCashierStore.getState().clearShift();
      queryClient.clear();

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
