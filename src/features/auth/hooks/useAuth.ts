import { RoleEnum } from "@/constants";
import { useAuthStore } from "@/stores/auth.store";

export function useAuth() {
  const { user, token, tempToken, locations, logout } = useAuthStore();

  const isAuthenticated = !!token && !!user;
  const isTempAuth = !!tempToken && !token; // está en paso 2

  function hasRole(...roles: RoleEnum[]): boolean {
    return !!user?.role && roles.includes(user.role);
  }

  const isManager = user?.role === RoleEnum.MANAGER;
  const isAdmin = user?.role === RoleEnum.ADMIN;
  const isCashier = user?.role === RoleEnum.CASHIER;

  return {
    user,
    token,
    tempToken,
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
