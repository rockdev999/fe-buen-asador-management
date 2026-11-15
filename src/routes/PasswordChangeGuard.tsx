import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { PATHS } from "./paths";

/**
 * Mientras el usuario tenga la contraseña temporal pendiente de cambio, el
 * backend responde 403 a todo el layout: se le lleva a /change-password antes
 * de montar AppLayout (así no se disparan peticiones que fallarían).
 */
export function PasswordChangeGuard() {
  const { user } = useAuth();

  if (user?.mustChangePassword) {
    return <Navigate to={PATHS.CHANGE_PASSWORD} replace />;
  }

  return <Outlet />;
}
