import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/hooks/useAuth";
import { RoleEnum } from "@/constants";
import { PATHS } from "@/routes";

export function NotFound() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const homeRoute =
    user?.role === RoleEnum.CASHIER ? PATHS.SHIFTS : PATHS.DASHBOARD;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-white">
      <span className="text-6xl font-bold text-white/20">404</span>
      <h1 className="text-xl font-semibold">Página no encontrada</h1>
      <p className="text-white/50 text-sm">
        La página que buscas no existe o no tienes acceso.
      </p>
      <button
        onClick={() => navigate(homeRoute)}
        className="mt-2 px-4 py-2 bg-brand rounded-lg text-sm font-medium hover:bg-brand/80 transition-colors"
      >
        Volver al inicio
      </button>
    </div>
  );
}
