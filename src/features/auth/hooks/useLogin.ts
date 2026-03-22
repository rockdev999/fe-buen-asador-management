import { useAuthStore } from "@/stores/auth.store";
import { LoginDto } from "@/types/auth.types";
import { useMutation } from "@tanstack/react-query";
import { authFetch } from "../api/auth.service";

export function useLogin() {
  const { setTempAuth } = useAuthStore();

  return useMutation({
    mutationFn: (dto: LoginDto) => authFetch.login(dto),
    onSuccess: (data) => {
      setTempAuth(data.token, data.locations);
    },
  });
}

export function useSelectLocation() {
  const { setFullAuth, tempToken } = useAuthStore();

  return useMutation({
    mutationFn: (locationId: string) =>
      authFetch.selectLocation({
        locationId,
        token: tempToken!,
      }),
    onSuccess: (data) => {
      setFullAuth(data.user, data.token);
    },
  });
}
