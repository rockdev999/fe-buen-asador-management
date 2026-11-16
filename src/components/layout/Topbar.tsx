import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Building2, LogOut, Repeat, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import { RoleEnum } from "@/constants";
import { t } from "@/locales/es";
import { SwitchLocationModal } from "@/features/auth/components/SwitchLocationModal";
import { logoutSession } from "@/services/auth/session.service";
import { StockAlertsBell } from "@/features/notifications/components/StockAlertsBell";
import { WhatsappOrdersButton } from "@/features/whatsapp/components/WhatsappOrdersButton";
import { useActiveShift } from "@/features/pos/hooks/useShift";
import { PATHS } from "@/routes/paths";
import { useNavigate } from "react-router-dom";

const trans = t.auth.switchLocation;

export function Topbar() {
  const { user, isCashier } = useAuth();
  const navigate = useNavigate();
  const [isSwitchLocationOpen, setIsSwitchLocationOpen] = useState(false);
  const { isOpen: hasOpenShift, status: shiftStatus } =
    useActiveShift(isCashier);

  const canSwitchLocation =
    user?.role === RoleEnum.ADMIN || user?.role === RoleEnum.CASHIER;

  function handleLogout() {
    logoutSession();
  }

  return (
    <header className="h-14 bg-white border-b border-surface flex items-center px-5 gap-3 flex-shrink-0">
      {/* Brand + location */}
      <div className="flex items-center gap-2">
        {user?.locationId && (
          <div className="flex items-center gap-1 bg-surface text-brand-dark text-[11px] font-medium px-2 py-0.5 rounded-full mt-1">
            <Building2 size={11} />
            <span>Sucursal</span>
          </div>
        )}
        <span className="text-lg font-medium text-dark">
          {user?.locationName}
        </span>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        {isCashier && shiftStatus !== "pending" && (
          <button
            type="button"
            onClick={() => navigate(PATHS.SHIFTS)}
            className={
              hasOpenShift
                ? "text-xs font-medium bg-inkblack text-green-400 px-2 py-1 rounded"
                : "text-xs font-medium bg-surface text-muted-foreground px-2 py-1 rounded"
            }
          >
            {hasOpenShift ? "Turno abierto" : "Sin turno"}
          </button>
        )}
        <WhatsappOrdersButton />
        <StockAlertsBell />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-white text-xs font-medium hover:bg-brand-dark transition-colors">
              {user ? getInitials(user.name) : "U"}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-surface rounded-lg border shadow-md"
          >
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <User size={14} />
              Mi perfil
            </DropdownMenuItem>
            {canSwitchLocation && (
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => setIsSwitchLocationOpen(true)}
              >
                <Repeat size={14} />
                {trans.trigger}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut size={14} />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isSwitchLocationOpen && (
        <SwitchLocationModal onClose={() => setIsSwitchLocationOpen(false)} />
      )}
    </header>
  );
}
