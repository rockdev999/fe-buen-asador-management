import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ChefHat, Package, Wheat } from "lucide-react";
import { PageHeader } from "@/components/shared/DataTable/PageHeader";
import { cn } from "@/lib/utils";
import { IngredientsTab } from "./components/IngredientsTab";
import { StockTab } from "./components/StockTab";
import { RecipesTab } from "./components/RecipesTab";

type SuppliesTab = "ingredients" | "stock" | "recipes";

const TABS: { key: SuppliesTab; label: string; icon: typeof Wheat }[] = [
  { key: "ingredients", label: "Insumos", icon: Wheat },
  { key: "stock", label: "Stock", icon: Package },
  { key: "recipes", label: "Recetas", icon: ChefHat },
];

export const Supplies = () => {
  const location = useLocation();
  const requestedTab = (location.state as { tab?: SuppliesTab } | null)?.tab;
  const [activeTab, setActiveTab] = useState<SuppliesTab>(
    requestedTab ?? "ingredients",
  );

  // Permite abrir una pestaña concreta vía navigate(path, { state: { tab } }),
  // p. ej. desde el toast de alerta de insumo, aunque ya se esté en esta página.
  // Cada navegación genera un location.key nuevo; se ajusta el estado en render.
  const [lastLocationKey, setLastLocationKey] = useState(location.key);
  if (location.key !== lastLocationKey) {
    setLastLocationKey(location.key);
    if (requestedTab) setActiveTab(requestedTab);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Insumos" subtitle="Gestiona insumos, stock, kardex y recetas." />

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
        {activeTab === "ingredients" && <IngredientsTab />}
        {activeTab === "stock" && <StockTab />}
        {activeTab === "recipes" && <RecipesTab />}
      </div>
    </div>
  );
};
