import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Toaster } from "./components/ui/sonner.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppRouter } from "./routes/Router.tsx";
import { queryClient } from "@/lib/query-client";
import "@/features/pos/styles/ticket.css";
import { persistOfflineQueries } from "@/features/offline/services/offline-cache";

// Copia local del menú y del turno activo, para vender sin conexión.
persistOfflineQueries(queryClient);

// Service worker: guarda el app shell para que el POS abra sin internet.
// Solo en producción: en desarrollo interferiría con el HMR de Vite.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors />
      <AppRouter />
    </QueryClientProvider>
  </StrictMode>,
);
