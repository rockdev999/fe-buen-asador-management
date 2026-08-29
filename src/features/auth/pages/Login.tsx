import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useRef } from "react";
import { PATHS } from "@/routes";
import { t } from "@/locales/es";
import { RoleEnum } from "@/constants";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "./components/AuthLayout";
import { getInitials } from "@/lib/utils";
import { SelectLocationCard } from "./components/SelectLocationCard";
import { LoginCard } from "./components/LoginCard";
import { useSelectLocation } from "../hooks/useSelectLocation";

const trans = t.auth.selectLocation;

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

  if (isTempAuth) {
    return (
      <AuthLayout
        step={2}
        title={t.auth.selectLocation.brand.tagline}
        description={t.auth.selectLocation.brand.description}
        userName={user?.name}
        userEmail={user?.email}
        userInitials={user ? getInitials(user.name) : undefined}
        card={
          isManagerOnly ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10">
              <Loader2 className="h-5 w-5 animate-spin text-brand" />
              <p className="text-sm text-muted-foreground">
                {trans.submitting}
              </p>
            </div>
          ) : (
            <SelectLocationCard />
          )
        }
      />
    );
  }

  return (
    <AuthLayout
      step={1}
      title={t.auth.login.brand.tagline}
      description={t.auth.login.brand.description}
      card={<LoginCard />}
    />
  );
};
