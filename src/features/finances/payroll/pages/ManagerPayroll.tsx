import { useState } from "react";
import { List, PieChart, Wallet } from "lucide-react";
import { PageHeader } from "@/components/shared/DataTable/PageHeader";
import { cn } from "@/lib/utils";
import { ManagerPayrollListTab } from "./components/ManagerPayrollListTab";
import { ManagerPayrollReportTab } from "./components/ManagerPayrollReportTab";
import { ManagerPayrollWagesTab } from "./components/ManagerPayrollWagesTab";

type PayrollTab = "list" | "report" | "wages";

const TABS: { key: PayrollTab; label: string; icon: typeof List }[] = [
  { key: "list", label: "Listado", icon: List },
  { key: "report", label: "Reporte", icon: PieChart },
  { key: "wages", label: "Sueldos", icon: Wallet },
];

export function ManagerPayroll() {
  const [activeTab, setActiveTab] = useState<PayrollTab>("list");

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-2xl">
      <PageHeader
        title="Nómina"
        subtitle="Vista global de nómina de todas las sucursales"
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
        {activeTab === "list" && <ManagerPayrollListTab />}
        {activeTab === "report" && <ManagerPayrollReportTab />}
        {activeTab === "wages" && <ManagerPayrollWagesTab />}
      </div>
    </div>
  );
}
