import { RoleEnum } from "@/constants";
import { t } from "@/locales/es";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useSelectLocation } from "../hooks/useSelectLocation";
import { useEffect, useState } from "react";
import { LocationWithRoleDTO } from "@/features/locations/dto/location.dto";
import { PATHS } from "@/routes";
import { cn, getInitials } from "@/lib/utils";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "../components/AuthLayout";
import { useAuthStore } from "@/stores/auth.store";

const trans = t.auth.selectLocation;

function getRoleLabel(role: RoleEnum): string {
  return trans.roles[role] ?? role;
}

export const SelectLocation = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isTempAuth, user: tempUser, locations } = useAuth();
  const { mutate: selectLocation, status } = useSelectLocation();
  const [selected, setSelected] = useState<LocationWithRoleDTO | null>(null);

  // Guards
  useEffect(() => {
    if (isAuthenticated) navigate(PATHS.DASHBOARD, { replace: true });
    if (!isTempAuth) navigate(PATHS.LOGIN, { replace: true });
  }, [isAuthenticated, isTempAuth]);

  function handleSubmit() {
    if (!selected) return;
    selectLocation(selected.id);
  }

  const subtitle =
    locations.length === 1
      ? trans.subtitle_one.replace("{{count}}", "1")
      : trans.subtitle_other.replace("{{count}}", String(locations.length));

  return (
    <AuthLayout
      step={2}
      title={trans.brand.tagline}
      description={trans.brand.description}
      userName={tempUser?.name}
      userEmail={tempUser?.email}
      userInitials={tempUser ? getInitials(tempUser.name) : undefined}
      card={
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-medium text-inkblack mb-1">
              {trans.title}
            </h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {/* Location list */}
          {locations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {trans.noLocations}
            </p>
          ) : (
            <div className="flex flex-col gap-2 mb-6">
              {locations.map((location) => (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => setSelected(location)}
                  className={cn(
                    "flex items-center gap-3 p-3.5 rounded-xl border-[1.5px] transition-all text-left w-full",
                    selected?.id === location.id
                      ? "border-brand bg-white"
                      : "border-surface bg-surface hover:border-brand-light hover:bg-white",
                  )}
                >
                  <div className="w-9 h-9 bg-brand/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 size={16} className="text-brand" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-inkblack truncate">
                      {location.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getRoleLabel(location.role)}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all",
                      selected?.id === location.id
                        ? "border-brand bg-brand"
                        : "border-muted-foreground/30",
                    )}
                  >
                    {selected?.id === location.id && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <Button
            type="button"
            disabled={!selected || status === "pending"}
            onClick={handleSubmit}
            className="w-full bg-brand hover:bg-brand-dark text-white font-medium transition-colors"
          >
            {status === "pending" ? trans.submitting : trans.submit}
          </Button>

          {/* Back — logout limpio */}
          <button
            type="button"
            onClick={() => {
              useAuthStore.getState().logout();
              navigate(PATHS.LOGIN);
            }}
            className="w-full mt-4 text-xs text-brand hover:text-brand-dark transition-colors text-center block"
          >
            {trans.back}
          </button>
        </div>
      }
    />
  );
};
