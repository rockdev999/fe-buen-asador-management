import { Clock, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";
import { WhatsappOrder } from "../../models/whatsapp-order.model";

const MIN = 60_000;

function formatCountdown(ms: number) {
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = String(totalSec % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

function formatElapsed(ms: number) {
  const minutes = Math.floor(ms / MIN);
  if (minutes < 1) return "recién";
  if (minutes < 60) return `hace ${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `hace ${h} h ${m} min` : `hace ${h} h`;
}

/**
 * Columna "Espera".
 *  - PENDING con plazo: cuenta regresiva hasta `expiresAt` ("Vence en 7:42").
 *    Verde > 10 min · amarillo 5–10 · rojo < 5. En 0 muestra "Venciendo…":
 *    el FE no cancela, espera el `order-status` que envía el backend.
 *  - Resto: tiempo desde que llegó el pedido ("hace 18 min").
 */
export function WaitTime({ order, now }: { order: WhatsappOrder; now: number }) {
  if (order.expiresAt) {
    const left = Math.max(0, new Date(order.expiresAt).getTime() - now);
    const expired = left === 0;
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums",
          left > 10 * MIN
            ? "bg-green-50 text-green-700"
            : left > 5 * MIN
              ? "bg-yellow-50 text-yellow-700"
              : "bg-red-50 text-red-600",
          left <= 5 * MIN && "animate-pulse",
        )}
        title="Si nadie lo aprueba, el sistema lo cancela automáticamente"
      >
        <Hourglass size={11} />
        {expired ? "Venciendo…" : `Vence en ${formatCountdown(left)}`}
      </span>
    );
  }

  if (!order.createdAt) return <span className="text-muted-foreground">--</span>;
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap text-[11px] text-muted-foreground tabular-nums">
      <Clock size={11} />
      {formatElapsed(now - new Date(order.createdAt).getTime())}
    </span>
  );
}
