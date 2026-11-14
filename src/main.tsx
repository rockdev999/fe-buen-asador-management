import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Toaster } from "./components/ui/sonner.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppRouter } from "./routes/Router.tsx";
import { queryClient } from "@/lib/query-client";
import "@/features/pos/styles/ticket.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors />
      <AppRouter />
    </QueryClientProvider>
  </StrictMode>,
);
