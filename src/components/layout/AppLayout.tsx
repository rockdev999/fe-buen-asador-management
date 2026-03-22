// import { useUiStore } from "@/stores/ui.store";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";
import { Topbar } from "./Topbar";
import { Outlet } from "react-router-dom";
import { GlobalErrorToast } from "../shared/GlobalErrorToast";
import { Toaster } from "../ui/sonner";

export function AppLayout() {
  //   const { sidebarOpen } = useUiStore();

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
