import { useAuth } from "@/features/auth/hooks/useAuth";
import { ManagerPayroll } from "./ManagerPayroll";
import { CashierAdminPayroll } from "./CashierAdminPayroll";

export function Payroll() {
  const { isManager } = useAuth();

  if (isManager) return <ManagerPayroll />;
  return <CashierAdminPayroll />;
}
