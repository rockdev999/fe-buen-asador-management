import { useEffect, useMemo, useState } from "react";
import { Loader2, MessageCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/DataTable/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { WhatsappOrderDrawer } from "./components/WhatsappOrderDrawer";
import { WhatsappOrderRow } from "./components/WhatsappOrderRow";

type TabKey = "pending" | "active" | "ready";

const TABS: {
  key: TabKey;
  title: string;
  statuses: OrderStatusEnum[];
  accent: string;
  empty: string;
}[] = [
  {
    key: "pending",
    title: "Pendientes",
    statuses: [OrderStatusEnum.PENDING],
    accent: "bg-yellow-400",
    empty: "No hay pedidos esperando aprobación",
  },
  {
    key: "active",
    title: "En curso",
    statuses: [OrderStatusEnum.CONFIRMED, OrderStatusEnum.PREPARING],
    accent: "bg-blue-500",
    empty: "No hay pedidos confirmados ni en preparación",
  },
  {
    key: "ready",
    title: "Listos",
    statuses: [OrderStatusEnum.READY, OrderStatusEnum.DELIVERED],
    accent: "bg-brand",
    empty: "No hay pedidos listos ni entregados",
  },
];

const TABLE_HEADERS = ["Código", "Espera", "Cliente", "Tipo", "Total", "Pago", "Acción"];

const PAYMENT_FROM_PREFERENCE: Record<WhatsappPaymentPreferenceEnum, PaymentMethodEnum> = {
  [WhatsappPaymentPreferenceEnum.CASH]: PaymentMethodEnum.CASH,
  [WhatsappPaymentPreferenceEnum.QR]: PaymentMethodEnum.QR,
};

/** Reloj de la cuenta regresiva de la columna "Espera". */
function useNow(intervalMs = 1_000) {
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
 * en useWhatsappOrdersStream, montado en el layout: aquí solo se lee el store
 * y se filtra por pestaña en el cliente.
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

  const [tab, setTab] = useState<TabKey>("pending");
  const [pending, setPending] = useState<{ id: string; status: OrderStatusEnum } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [chargeId, setChargeId] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [paidCustomer, setPaidCustomer] = useState<string | null | undefined>(undefined);
  const [isReloading, setIsReloading] = useState(false);

  // Se guardan ids y se leen del store: si el pedido cambia o sale de la
  // bandeja (cobrado, cancelado por otro cajero o por tiempo), el drawer y
  // los modales lo reflejan o se cierran solos.
  const selected = selectedId ? (ordersById[selectedId] ?? null) : null;
  const cancelTarget = cancelId ? (ordersById[cancelId] ?? null) : null;
  const chargeTarget = chargeId ? (ordersById[chargeId] ?? null) : null;

  const counts = useMemo(
    () =>
      Object.fromEntries(
        TABS.map((t) => [t.key, orders.filter((o) => t.statuses.includes(o.status)).length]),
      ) as Record<TabKey, number>,
    [orders],
  );
  const activeTab = TABS.find((t) => t.key === tab)!;
  const visibleOrders = orders.filter((o) => activeTab.statuses.includes(o.status));

  const pendingStatusOf = (orderId: string) =>
    pending?.id === orderId ? pending.status : null;

  function changeStatus(order: WhatsappOrder, status: OrderStatusEnum, reason?: string) {
    setPending({ id: order.id, status });
    updateStatus(
      { id: order.id, status, reason },
      {
        onSuccess: () => {
          if (status === OrderStatusEnum.CANCELLED) setCancelId(null);
        },
        onError: (err) => {
          // 409: lo canceló el sistema por tiempo, otro cajero ya lo movió o
          // cambió mientras se procesaba. El interceptor mostró el mensaje;
          // se recarga para reflejar su estado real (o quitarlo si terminó).
          if (statusOf(err) === 409) {
            setCancelId(null);
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
    setChargeId(order.id);
  }

  const chargeTotal = chargeTarget
    ? Math.max(0, Math.round((chargeTarget.subtotal - discount) * 100) / 100)
    : 0;

  function confirmCharge(method: PaymentMethodEnum, receivedAmount: number) {
    if (!chargeTarget) return;
    const target = chargeTarget;
    createSale(
      { orderId: target.id, paymentMethod: method, receivedAmount, totalDiscount: discount },
      {
        onSuccess: () => {
          // useCreateSale ya quitó el pedido de la bandeja
          setPaidCustomer(target.customerName);
          setChargeId(null);
          setSelectedId(null);
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

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl">
      <PageHeader
        title="Pedidos WhatsApp"
        subtitle={
          counts.pending > 0
            ? `${counts.pending} ${counts.pending === 1 ? "pedido espera" : "pedidos esperan"} aprobación`
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

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as TabKey)}
        className="flex min-h-0 flex-1 flex-col pt-4"
      >
        <TabsList className="h-auto w-fit flex-wrap justify-start gap-1 bg-white p-1 shadow-sm">
          {TABS.map((t) => (
            <TabsTrigger
              key={t.key}
              value={t.key}
              className="gap-2 px-3 py-1.5 text-xs data-[state=active]:bg-surface data-[state=active]:text-inkblack"
            >
              <span className={cn("h-2 w-2 rounded-full", t.accent)} />
              {t.title}
              <span
                className={cn(
                  "min-w-5 rounded-full px-1.5 text-[11px] tabular-nums",
                  t.key === "pending" && counts.pending > 0
                    ? "bg-yellow-400 font-semibold text-inkblack"
                    : "bg-surface text-muted-foreground",
                )}
              >
                {counts[t.key]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-surface bg-white">
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
          ) : (
            <div className="flex-1 overflow-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead className="sticky top-0 z-10 bg-surface">
                  <tr>
                    {TABLE_HEADERS.map((h) => (
                      <th
                        key={h}
                        className={cn(
                          "px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground first:pl-4 last:pr-4",
                          h === "Acción" && "text-right",
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleOrders.map((order) => (
                    <WhatsappOrderRow
                      key={order.id}
                      order={order}
                      now={now}
                      canChangeStatus={canChangeStatus}
                      canCharge={canCharge}
                      showLocation={isManager}
                      pendingStatus={pendingStatusOf(order.id)}
                      isSelected={order.id === selectedId}
                      onOpen={() => setSelectedId(order.id)}
                      onAdvance={(status) => changeStatus(order, status)}
                      onCancel={() => setCancelId(order.id)}
                      onCharge={() => openCharge(order)}
                    />
                  ))}
                </tbody>
              </table>
              {visibleOrders.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-14 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-green-600">
                    <MessageCircle size={20} />
                  </div>
                  <p className="text-xs text-muted-foreground">{activeTab.empty}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Tabs>

      <WhatsappOrderDrawer
        order={selected}
        now={now}
        canChangeStatus={canChangeStatus}
        canCharge={canCharge}
        showLocation={isManager}
        pendingStatus={selected ? pendingStatusOf(selected.id) : null}
        onClose={() => setSelectedId(null)}
        onAdvance={(status) => selected && changeStatus(selected, status)}
        onCancel={() => selected && setCancelId(selected.id)}
        onCharge={() => selected && openCharge(selected)}
      />

      {cancelTarget && (
        <CancelOrderModal
          shortId={cancelTarget.shortId}
          isReject={cancelTarget.status === OrderStatusEnum.PENDING}
          isLoading={pendingStatusOf(cancelTarget.id) === OrderStatusEnum.CANCELLED}
          onConfirm={(reason) => changeStatus(cancelTarget, OrderStatusEnum.CANCELLED, reason)}
          onClose={() => setCancelId(null)}
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
          onClose={() => setChargeId(null)}
          isLoading={createSaleStatus === "pending"}
        />
      )}

      {paidCustomer !== undefined && sale && (
        <OrderSuccessModal
          sale={sale}
          customerName={paidCustomer}
          closeLabel="Cerrar"
          // FASE 2 - Facturación
          // onEmitInvoice={() => setPaidCustomer(undefined)}
          onClose={() => setPaidCustomer(undefined)}
        />
      )}
    </div>
  );
}
