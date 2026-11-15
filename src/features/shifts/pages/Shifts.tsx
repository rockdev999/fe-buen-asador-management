import { useAuth } from "@/features/auth/hooks/useAuth";
import { CashierShift } from "./CashierShift";
import { ShiftsHistory } from "./ShiftsHistory";

// CASHIER: su caja (turno activo y cierre). ADMIN/MANAGER: historial y aprobación.
export function Shifts() {
  const { isCashier } = useAuth();

  if (isCashier) return <CashierShift />;
  return <ShiftsHistory />;
}
