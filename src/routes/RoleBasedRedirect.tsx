import { useAuth } from "@/features/auth/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { PATHS } from "./paths";
import { getHomePath } from "./home-path";

export function RoleBasedRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to={PATHS.LOGIN} replace />;

  return <Navigate to={getHomePath(user.role)} replace />;
}
