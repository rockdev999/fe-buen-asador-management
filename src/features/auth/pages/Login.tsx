import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useRef } from "react";
import { PATHS } from "@/routes";
import { t } from "@/locales/es";
import { RoleEnum } from "@/constants";
import { AuthLayout } from "./components/AuthLayout";
import { getInitials } from "@/lib/utils";
import { SelectLocationCard } from "./components/SelectLocationCard";
import { LoginCard } from "./components/LoginCard";
import { useSelectLocation } from "../hooks/useSelectLocation";

export const Login = () => {
  const navigate = useNavigate();

  const { isAuthenticated, isTempAuth, user, locations } = useAuth();
  const { mutate: selectLocation } = useSelectLocation();
  const autoSelectTriggered = useRef(false);

  const isManagerOnly =
    locations.length > 0 &&
    locations.every((location) => location.role === RoleEnum.MANAGER);

  useEffect(() => {
    if (isAuthenticated) navigate(PATHS.DASHBOARD, { replace: true });
  }, [isAuthenticated]);

  // Los MANAGER no operan en una sucursal fija: se omite la selección y se envía location null.
  useEffect(() => {
    if (isTempAuth && isManagerOnly && !autoSelectTriggered.current) {
      autoSelectTriggered.current = true;
      selectLocation(null);
    }
  }, [isTempAuth, isManagerOnly]);

  // Solo quien debe elegir sucursal ve el paso 2.
  if (isTempAuth && !isManagerOnly) {
    return (
      <AuthLayout
        step={2}
        title={t.auth.selectLocation.brand.tagline}
        description={t.auth.selectLocation.brand.description}
        userName={user?.name}
        userEmail={user?.email}
        userInitials={user ? getInitials(user.name) : undefined}
        card={<SelectLocationCard />}
      />
    );
  }

  // El MANAGER se queda en el paso 1 con el botón cargando mientras se envía
  // location null: así no parpadea una pantalla intermedia antes del dashboard.
  return (
    <AuthLayout
      step={1}
      title={t.auth.login.brand.tagline}
      description={t.auth.login.brand.description}
      card={<LoginCard isFinishing={isTempAuth && isManagerOnly} />}
    />
  );
};
