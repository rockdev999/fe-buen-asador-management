import { useAuth } from "@/features/auth/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";
import { PATHS } from "./paths";

export function ProtectedRoute() {
  const { isAuthenticated, isTempAuth } = useAuth();

  // Está en paso 2 (selección de sucursal)
  if (isTempAuth) return <Navigate to={PATHS.SELECT_LOCATION} replace />;

  // No autenticado
  if (!isAuthenticated) return <Navigate to={PATHS.LOGIN} replace />;

  return <Outlet />;
}
