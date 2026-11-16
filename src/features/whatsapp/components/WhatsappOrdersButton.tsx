import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { PATHS } from "@/routes/paths";
import { usePendingWhatsappCount } from "../stores/whatsapp-orders.store";
import { WHATSAPP_ROLES } from "../hooks/useWhatsappOrdersStream";

/** Acceso a la bandeja de WhatsApp con el número de pedidos PENDING. */
export function WhatsappOrdersButton() {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const pending = usePendingWhatsappCount();

  if (!hasRole(...WHATSAPP_ROLES)) return null;

  const badge = pending > 99 ? "99+" : String(pending);

  return (
    <button
      type="button"
      onClick={() => navigate(PATHS.WHATSAPP_ORDERS)}
      aria-label={
        pending > 0
          ? `${pending} pedidos de WhatsApp por aprobar`
          : "Pedidos de WhatsApp"
      }
      title="Pedidos de WhatsApp"
      className="relative flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-inkblack"
    >
      <MessageCircle size={16} />
      {pending > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 animate-pulse items-center justify-center rounded-full bg-green-600 px-1 text-[9px] font-semibold leading-none text-white tabular-nums ring-2 ring-white">
          {badge}
        </span>
      )}
    </button>
  );
}
