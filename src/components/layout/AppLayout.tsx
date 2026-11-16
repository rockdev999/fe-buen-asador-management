// import { useUiStore } from "@/stores/ui.store";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";
import { Topbar } from "./Topbar";
import { Outlet } from "react-router-dom";
import { GlobalErrorToast } from "../shared/GlobalErrorToast";
import { Toaster } from "../ui/sonner";
import { useStockAlertsStream } from "@/features/notifications/hooks/useStockAlertsStream";
import { useSessionKeepAlive } from "@/features/auth/hooks/useSessionKeepAlive";
import { useWhatsappOrdersStream } from "@/features/whatsapp/hooks/useWhatsappOrdersStream";
import { useOfflineSync } from "@/features/offline/hooks/useOfflineSync";

export function AppLayout() {
  //   const { sidebarOpen } = useUiStore();
  useSessionKeepAlive();
  useStockAlertsStream();
  useWhatsappOrdersStream();
  useOfflineSync();

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div
        className={cn(
          "flex flex-col flex-1 overflow-hidden transition-all duration-200",
        )}
      >
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <GlobalErrorToast />
      <Toaster position="top-right" richColors />
    </div>
  );
}
