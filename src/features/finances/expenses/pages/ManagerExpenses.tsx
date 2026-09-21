import { useState } from "react";
import { List, PieChart } from "lucide-react";
import { PageHeader } from "@/components/shared/DataTable/PageHeader";
import { cn } from "@/lib/utils";
import { ManagerExpensesListTab } from "./components/ManagerExpensesListTab";
import { ManagerExpensesReportTab } from "./components/ManagerExpensesReportTab";

type ExpensesTab = "list" | "report";

const TABS: { key: ExpensesTab; label: string; icon: typeof List }[] = [
  { key: "list", label: "Listado", icon: List },
  { key: "report", label: "Reporte", icon: PieChart },
];

export function ManagerExpenses() {
  const [activeTab, setActiveTab] = useState<ExpensesTab>("list");

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-2xl">
      <PageHeader
        title="Egresos"
        subtitle="Vista global de egresos de todas las sucursales"
      />

      <div className="flex items-center gap-1 px-4 py-2 border-b border-surface bg-white flex-shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-1.5 h-8 px-3 rounded-xl text-[12px] font-medium transition-all",
              activeTab === tab.key
                ? "bg-brand/8 text-brand"
                : "text-muted-foreground hover:bg-surface hover:text-inkblack",
            )}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "list" && <ManagerExpensesListTab />}
        {activeTab === "report" && <ManagerExpensesReportTab />}
      </div>
    </div>
  );
}
