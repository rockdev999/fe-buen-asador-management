import { useEffect, useMemo, useState } from "react";
import { Loader2, MessageCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/DataTable/PageHeader";
import { OrderStatusEnum, PaymentMethodEnum } from "@/constants";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { PaymentModal } from "@/features/pos/components/reviewAndPayment/PaymentModal";
import { OrderSuccessModal } from "@/features/pos/components/reviewAndPayment/OrderSuccessModal";
import { useUpdateOrderStatus } from "@/features/pos/hooks/useOrder";
import { useActiveShift } from "@/features/pos/hooks/useShift";
import { useCreateSale } from "@/features/sales/hooks/useSale";
import { cn } from "@/lib/utils";
import { WhatsappPaymentPreferenceEnum } from "../dto/whatsapp-order.dto";
import { fetchWhatsappOrders, useRefreshWhatsappOrder } from "../hooks/useWhatsappOrders";
import { sortByOldest, useWhatsappOrdersStore } from "../stores/whatsapp-orders.store";
import { WhatsappOrder } from "../models/whatsapp-order.model";
import { CancelOrderModal } from "./components/CancelOrderModal";
import { WhatsappOrderCard } from "./components/WhatsappOrderCard";

const COLUMNS: { title: string; statuses: OrderStatusEnum[]; accent: string }[] = [
  { title: "Por aprobar", statuses: [OrderStatusEnum.PENDING], accent: "bg-yellow-400" },
  { title: "Confirmados", statuses: [OrderStatusEnum.CONFIRMED], accent: "bg-blue-500" },
  { title: "En preparación", statuses: [OrderStatusEnum.PREPARING], accent: "bg-purple-500" },
  {
    title: "Listos / entregados",
    statuses: [OrderStatusEnum.READY, OrderStatusEnum.DELIVERED],
    accent: "bg-brand",
  },
];

const PAYMENT_FROM_PREFERENCE: Record<WhatsappPaymentPreferenceEnum, PaymentMethodEnum> = {
  [WhatsappPaymentPreferenceEnum.CASH]: PaymentMethodEnum.CASH,
  [WhatsappPaymentPreferenceEnum.QR]: PaymentMethodEnum.QR,
};

/** Reloj que avanza cada 30 s para el tiempo de espera de las tarjetas. */
function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

const statusOf = (err: unknown) => (err as { status?: number } | null)?.status;

/**
 * Bandeja de pedidos de WhatsApp. La sincronización (GET inicial + SSE) vive
 * en useWhatsappOrdersStream, montado en el layout: aquí solo se lee el store.
 */
export function WhatsappOrders() {
  const { isCashier, isAdmin, isManager } = useAuth();
  const canChangeStatus = isCashier || isAdmin;
  const canCharge = isCashier;

  const ordersById = useWhatsappOrdersStore((s) => s.orders);
  const loadStatus = useWhatsappOrdersStore((s) => s.loadStatus);
  const orders = useMemo(() => sortByOldest(ordersById), [ordersById]);
  const now = useNow();

  const refreshOrder = useRefreshWhatsappOrder();
  const { mutate: updateStatus } = useUpdateOrderStatus();
  const { isOpen: hasActiveShift } = useActiveShift(isCashier);
  const { mutate: createSale, status: createSaleStatus, data: sale } = useCreateSale();

  const [pending, setPending] = useState<{ id: string; status: OrderStatusEnum } | null>(null);
  const [cancelTarget, setCancelTarget] = useState<WhatsappOrder | null>(null);
  const [chargeTarget, setChargeTarget] = useState<WhatsappOrder | null>(null);
  const [discount, setDiscount] = useState(0);
  const [paidCustomer, setPaidCustomer] = useState<string | null | undefined>(undefined);
  const [isReloading, setIsReloading] = useState(false);

  // Si otro cajero cancela o cobra el pedido mientras está abierto el cobro
  useEffect(() => {
    if (chargeTarget && !ordersById[chargeTarget.id]) setChargeTarget(null);
  }, [chargeTarget, ordersById]);

  function changeStatus(order: WhatsappOrder, status: OrderStatusEnum, reason?: string) {
    setPending({ id: order.id, status });
    updateStatus(
      { id: order.id, status, reason },
      {
        onSuccess: () => {
          if (status === OrderStatusEnum.CANCELLED) setCancelTarget(null);
        },
        onError: (err) => {
          // 409: otro cajero ya lo movió. El interceptor mostró el mensaje;
          // se recarga el pedido para mostrar su estado real.
          if (statusOf(err) === 409) {
            setCancelTarget(null);
            void refreshOrder(order.id);
          }
        },
        onSettled: () => setPending(null),
      },
    );
  }

  function openCharge(order: WhatsappOrder) {
    if (!hasActiveShift) {
      toast.warning("Necesitas un turno de caja abierto para cobrar");
      return;
    }
    setDiscount(0);
    setChargeTarget(order);
  }

  const chargeTotal = chargeTarget
    ? Math.max(0, Math.round((chargeTarget.subtotal - discount) * 100) / 100)
    : 0;

  function confirmCharge(method: PaymentMethodEnum, receivedAmount: number) {
    if (!chargeTarget) return;
    const target = chargeTarget;
    createSale(
      {
        orderId: target.id,
        paymentMethod: method,
        receivedAmount,
        totalDiscount: discount,
      },
      {
        onSuccess: () => {
          // useCreateSale ya quitó el pedido de la bandeja
          setPaidCustomer(target.customerName);
          setChargeTarget(null);
        },
        onError: (err) => {
          // 400/409: ya no es cobrable o no hay turno; refrescar su estado
          if (statusOf(err) === 400 || statusOf(err) === 409) void refreshOrder(target.id);
        },
      },
    );
  }

  async function handleReload() {
    setIsReloading(true);
    try {
      useWhatsappOrdersStore.getState().replaceAll(await fetchWhatsappOrders());
    } catch {
      // El interceptor ya mostró el error
    } finally {
      setIsReloading(false);
    }
  }

  const pendingCount = orders.filter((o) => o.status === OrderStatusEnum.PENDING).length;

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl">
      <PageHeader
        title="Pedidos WhatsApp"
        subtitle={
          pendingCount > 0
            ? `${pendingCount} ${pendingCount === 1 ? "pedido espera" : "pedidos esperan"} aprobación`
            : "Los pedidos nuevos aparecen aquí en tiempo real"
        }
        actions={
          <button
            type="button"
            onClick={handleReload}
            disabled={isReloading}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-surface bg-white px-3 text-xs text-muted-foreground transition-colors hover:text-inkblack disabled:opacity-60"
          >
            <RefreshCw size={13} className={cn(isReloading && "animate-spin")} />
            Actualizar
          </button>
        }
      />

      {loadStatus !== "ready" && orders.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          {loadStatus === "error" ? (
            <>
              <p>No se pudieron cargar los pedidos.</p>
              <button type="button" onClick={handleReload} className="text-brand hover:underline">
                Reintentar
              </button>
            </>
          ) : (
            <>
              <Loader2 size={20} className="animate-spin" />
              Cargando pedidos…
            </>
          )}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
            <MessageCircle size={22} />
          </div>
          <p className="text-sm font-medium text-inkblack">No hay pedidos de WhatsApp activos</p>
          <p className="text-xs text-muted-foreground">
            Cuando un cliente confirme su pedido, sonará un aviso.
          </p>
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto pt-4 pb-2 md:grid-cols-2 xl:grid-cols-4 xl:overflow-hidden">
          {COLUMNS.map((col) => {
            const items = orders.filter((o) => col.statuses.includes(o.status));
            return (
              <section key={col.title} className="flex min-h-0 flex-col rounded-xl bg-surface/60">
                <h2 className="flex items-center gap-2 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span className={cn("h-2 w-2 rounded-full", col.accent)} />
                  {col.title}
                  <span className="ml-auto rounded-full bg-white px-1.5 text-[11px] tabular-nums">
                    {items.length}
                  </span>
                </h2>
                <div className="flex flex-1 flex-col gap-3 px-2.5 pb-2.5 xl:overflow-y-auto">
                  {items.length === 0 ? (
                    <p className="py-6 text-center text-[11px] text-muted-foreground/70">Sin pedidos</p>
                  ) : (
                    items.map((order) => (
                      <WhatsappOrderCard
                        key={order.id}
                        order={order}
                        now={now}
                        canChangeStatus={canChangeStatus}
                        canCharge={canCharge}
                        showLocation={isManager}
                        pendingStatus={pending?.id === order.id ? pending.status : null}
                        onAdvance={(status) => changeStatus(order, status)}
                        onCancel={() => setCancelTarget(order)}
                        onCharge={() => openCharge(order)}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {cancelTarget && (
        <CancelOrderModal
          shortId={cancelTarget.shortId}
          isReject={cancelTarget.status === OrderStatusEnum.PENDING}
          isLoading={pending?.id === cancelTarget.id && pending.status === OrderStatusEnum.CANCELLED}
          onConfirm={(reason) => changeStatus(cancelTarget, OrderStatusEnum.CANCELLED, reason)}
          onClose={() => setCancelTarget(null)}
        />
      )}

      {chargeTarget && (
        <PaymentModal
          key={chargeTarget.id}
          clientName={chargeTarget.customerName}
          getSubtotal={() => chargeTarget.subtotal}
          getTotal={() => chargeTotal}
          discount={discount}
          onUpdateDiscount={setDiscount}
          defaultMethod={PAYMENT_FROM_PREFERENCE[chargeTarget.paymentPreference]}
          onConfirm={confirmCharge}
          onClose={() => setChargeTarget(null)}
          isLoading={createSaleStatus === "pending"}
        />
      )}

      {paidCustomer !== undefined && sale && (
        <OrderSuccessModal
          sale={sale}
          customerName={paidCustomer}
          onEmitInvoice={() => setPaidCustomer(undefined)}
          onClose={() => setPaidCustomer(undefined)}
        />
      )}
    </div>
  );
}
