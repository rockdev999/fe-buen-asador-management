import { useAuth } from "@/features/auth/hooks/useAuth";
import { PATHS } from "@/routes";
import { Building2, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate(PATHS.LOGIN);
  }

  return (
    <header className="h-14 bg-white border-b border-surface flex items-center px-5 gap-3 flex-shrink-0">
      {/* Brand + location */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-dark">Buen Asador</span>
        {user?.locationId && (
          <div className="flex items-center gap-1 bg-surface text-brand-dark text-[11px] font-medium px-2 py-0.5 rounded-full">
            <Building2 size={11} />
            <span>Sucursal</span>
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-white text-xs font-medium hover:bg-brand-dark transition-colors">
              {user ? getInitials(user.name) : "U"}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <User size={14} />
              Mi perfil
            </DropdownMenuItem>
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
    </header>
  );
}
