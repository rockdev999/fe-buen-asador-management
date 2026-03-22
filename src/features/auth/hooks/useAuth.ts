import { RoleEnum } from "@/constants";
import { useAuthStore } from "@/stores/auth.store";

export function useAuth() {
  const { user, token, tempToken, locations, logout } = useAuthStore();

  const isAuthenticated = !!token && !!user;
  const isTempAuth = !!tempToken && !token; // está en paso 2

  function hasRole(...roles: RoleEnum[]): boolean {
    return !!user?.rol && roles.includes(user.rol);
  }

  const isManager = user?.rol === RoleEnum.MANAGER;
  const isAdmin = user?.rol === RoleEnum.ADMIN;
  const isCashier = user?.rol === RoleEnum.CASHIER;

  return {
    user,
    token,
    locations,
    isAuthenticated,
    isTempAuth,
    hasRole,
    isManager,
    isAdmin,
    isCashier,
    logout,
  };
}
