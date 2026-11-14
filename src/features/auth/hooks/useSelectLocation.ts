import { useAuthStore } from "@/stores/auth.store";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { SessionResponseDTO } from "../dto/login.dto";
import { mapSessionDTOToModel } from "../mappers/login.mapper";
import { RoleEnum } from "@/constants";
import { PATHS } from "@/routes";
import { usePostHandler } from "@/hooks/api.handlers";
import { httpClient } from "@/services/http.client";
import { UUID } from "@/types/common";
import { useCashierStore } from "@/features/pos/stores/cashier.store";

export function useSelectLocation() {
  const { setSession } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return usePostHandler({
    mutationFn: (locationId: UUID | null) =>
      httpClient
        // locationId null explícito para MANAGER sin sucursal ({} responde 400)
        .post<SessionResponseDTO>("/auth/select-location", { locationId })
        .then((r) => r.data),

    onSuccessCallback: (data) => {
      // Trae un par de tokens nuevo; el backend ya cerró la sesión anterior.
      const session = mapSessionDTOToModel(data);
      setSession(session);
      const { user } = session;

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
