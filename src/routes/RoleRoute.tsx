import { RoleEnum } from "@/constants";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { NotFound } from "@/features/public/NotFound";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getHomePath } from "./home-path";

interface Props {
  roles: RoleEnum[];
}

export function RoleRoute({ roles }: Props) {
  const { user, hasRole } = useAuth();
  const location = useLocation();

  if (hasRole(...roles)) return <Outlet />;

  // Sin permiso: a la pantalla de inicio del rol. Si esa misma pantalla es la
  // prohibida (rol sin inicio propio), se muestra 404 para no entrar en bucle.
  const home = getHomePath(user?.role);
  if (home === location.pathname) return <NotFound />;

  return <Navigate to={home} replace />;
}
