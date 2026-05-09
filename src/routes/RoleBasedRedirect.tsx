import { useAuth } from "@/features/auth/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { PATHS } from "./paths";
import { RoleEnum } from "@/constants";

export function RoleBasedRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to={PATHS.LOGIN} replace />;

  switch (user.role) {
    case RoleEnum.MANAGER:
    case RoleEnum.ADMIN:
      return <Navigate to={PATHS.DASHBOARD} replace />;
    case RoleEnum.CASHIER:
      return <Navigate to={PATHS.SHIFTS} replace />;
    default:
      return <Navigate to={PATHS.LOGIN} replace />;
  }
}
