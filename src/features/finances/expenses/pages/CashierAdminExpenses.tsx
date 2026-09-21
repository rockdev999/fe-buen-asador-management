import { useState } from "react";
import { List, PieChart } from "lucide-react";
import { PageHeader } from "@/components/shared/DataTable/PageHeader";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { CashierAdminExpensesListTab } from "./components/CashierAdminExpensesListTab";
import { CashierAdminExpensesReportTab } from "./components/CashierAdminExpensesReportTab";

type ExpensesTab = "list" | "report";

export function CashierAdminExpenses() {
  const { isAdmin, isCashier, user } = useAuth();
  const [activeTab, setActiveTab] = useState<ExpensesTab>("list");

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-2xl">
      <PageHeader
        title="Egresos"
        subtitle={
          user?.locationName
            ? `Egresos de ${user.locationName}`
            : "Egresos de tu sucursal"
        }
      />

      {isAdmin && (
        <div className="flex items-center gap-1 px-4 py-2 border-b border-surface bg-white flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={cn(
              "flex items-center gap-1.5 h-8 px-3 rounded-xl text-[12px] font-medium transition-all",
              activeTab === "list"
                ? "bg-brand/8 text-brand"
                : "text-muted-foreground hover:bg-surface hover:text-inkblack",
            )}
          >
            <List size={13} />
            Listado
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("report")}
            className={cn(
              "flex items-center gap-1.5 h-8 px-3 rounded-xl text-[12px] font-medium transition-all",
              activeTab === "report"
                ? "bg-brand/8 text-brand"
                : "text-muted-foreground hover:bg-surface hover:text-inkblack",
            )}
          >
            <PieChart size={13} />
            Reporte
          </button>
        </div>
      )}

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "list" && (
          <CashierAdminExpensesListTab
            canManage={isAdmin}
            canCreate={isCashier}
          />
        )}
        {activeTab === "report" && isAdmin && <CashierAdminExpensesReportTab />}
      </div>
    </div>
  );
}
