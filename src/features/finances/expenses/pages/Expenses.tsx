import { useAuth } from "@/features/auth/hooks/useAuth";
import { ManagerExpenses } from "./ManagerExpenses";
import { CashierAdminExpenses } from "./CashierAdminExpenses";

export function Expenses() {
  const { isManager } = useAuth();

  if (isManager) return <ManagerExpenses />;
  return <CashierAdminExpenses />;
}
