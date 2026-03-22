import { RoleEnum } from "@/constants";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";
import { PATHS } from "./paths";

interface Props {
  roles: RoleEnum[];
}

export function RoleRoute({ roles }: Props) {
  const { hasRole } = useAuth();
  return hasRole(...roles) ? (
    <Outlet />
  ) : (
    <Navigate to={PATHS.DASHBOARD} replace />
  );
}
