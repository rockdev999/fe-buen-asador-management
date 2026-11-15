import { useAuthStore } from "@/stores/auth.store";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { SessionResponseDTO } from "../dto/login.dto";
import { mapSessionDTOToModel } from "../mappers/login.mapper";
import { getHomePath } from "@/routes/home-path";
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

      // Con contraseña temporal pendiente, el resto del sistema responde 403.
      navigate(
        user.mustChangePassword ? PATHS.CHANGE_PASSWORD : getHomePath(user.role),
        { replace: true },
      );
    },
  });
}
