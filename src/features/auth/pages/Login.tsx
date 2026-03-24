import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";
import { PATHS } from "@/routes";
import { t } from "@/locales/es";
import { AuthLayout } from "../components/AuthLayout";
import { getInitials } from "@/lib/utils";
import { SelectLocationCard } from "../components/SelectLocationCard";
import { LoginCard } from "../components/LoginCard";

export const Login = () => {
  const navigate = useNavigate();

  const { isAuthenticated, isTempAuth, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate(PATHS.DASHBOARD, { replace: true });
  }, [isAuthenticated]);

  if (isTempAuth) {
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

  return (
    <AuthLayout
      step={1}
      title={t.auth.login.brand.tagline}
      description={t.auth.login.brand.description}
      card={<LoginCard />}
    />
  );
};
