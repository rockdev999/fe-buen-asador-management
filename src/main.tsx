import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Toaster } from "./components/ui/sonner.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRouter } from "./routes/Router.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Repite la consulta una vez en caso de error
      staleTime: 1000 * 60 * 5, // Considera los datos frescos durante 5 minutos
      refetchOnWindowFocus: false, // No refetch al enfocar la ventana, para evitar consultas innecesarias
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors />
      <AppRouter />
    </QueryClientProvider>
  </StrictMode>,
);
