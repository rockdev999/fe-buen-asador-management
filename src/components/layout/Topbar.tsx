import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Building2, LogOut, Menu, Repeat, User, WifiOff } from "lucide-react";
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
import { OfflineStatusBadge } from "@/features/offline/components/OfflineStatusBadge";
import { useOfflineStore } from "@/features/offline/stores/offline.store";
import { AppModal } from "@/components/shared/Overlay/AppModal";
import { PanelHeader } from "@/components/shared/Overlay/PanelHeader";
import { PanelFooter } from "@/components/shared/Overlay/PanelFooter";
import { Button } from "@/components/shared/Basics/Button";
import { useUiStore } from "@/stores/ui.store";

const trans = t.auth.switchLocation;

export function Topbar() {
  const { user, isCashier } = useAuth();
  const navigate = useNavigate();
  const { mobileNavOpen, setMobileNavOpen } = useUiStore();
  const [isSwitchLocationOpen, setIsSwitchLocationOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const unsyncedSales = useOfflineStore((s) => s.sales.length);
  const { isOpen: hasOpenShift, status: shiftStatus } =
    useActiveShift(isCashier);

  const canSwitchLocation =
    user?.role === RoleEnum.ADMIN || user?.role === RoleEnum.CASHIER;

  function handleLogout() {
    // La cola offline no se borra al cerrar sesión, pero conviene avisar:
    // esas ventas solo se envían con la sesión de este cajero.
    if (unsyncedSales > 0) {
      setConfirmLogout(true);
      return;
    }
    logoutSession();
  }

  return (
    <header className="h-14 bg-white border-b border-surface flex items-center px-3 md:px-5 gap-2 md:gap-3 flex-shrink-0">
      {/* Menú: solo en móvil (en escritorio el lateral está siempre visible) */}
      <button
        type="button"
        onClick={() => setMobileNavOpen(true)}
        aria-label="Abrir menú"
        aria-controls="app-sidebar"
        aria-expanded={mobileNavOpen}
        className="md:hidden -ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-inkblack/70 hover:bg-surface"
      >
        <Menu size={20} />
      </button>

      {/* Brand + location */}
      <div className="flex items-center gap-2 min-w-0">
        {user?.locationId && (
          <div className="hidden sm:flex items-center gap-1 bg-surface text-brand-dark text-[11px] font-medium px-2 py-0.5 rounded-full mt-1">
            <Building2 size={11} />
            <span>Sucursal</span>
          </div>
        )}
        <span className="text-base md:text-lg font-medium text-dark truncate">
          {user?.locationName}
        </span>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        {isCashier && <OfflineStatusBadge />}
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

      {confirmLogout && (
        <AppModal size="sm" onClose={() => setConfirmLogout(false)}>
          <PanelHeader
            icon={WifiOff}
            title="Ventas offline sin sincronizar"
            onClose={() => setConfirmLogout(false)}
          />
          <div className="px-5 py-4 text-[12px] text-muted-foreground">
            {unsyncedSales === 1
              ? "Tienes 1 venta offline que aún no llega al servidor."
              : `Tienes ${unsyncedSales} ventas offline que aún no llegan al servidor.`}{" "}
            Se quedan guardadas en este equipo y se enviarán cuando vuelvas a
            iniciar sesión con tu usuario, en este mismo navegador.
          </div>
          <PanelFooter align="right">
            <Button variant="outline" onClick={() => setConfirmLogout(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmLogout(false);
                logoutSession();
              }}
            >
              Cerrar sesión igualmente
            </Button>
          </PanelFooter>
        </AppModal>
      )}

      {isSwitchLocationOpen && (
        <SwitchLocationModal onClose={() => setIsSwitchLocationOpen(false)} />
      )}
    </header>
  );
}
