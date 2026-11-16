import { ShiftModal } from "../components/ShiftModal";
import { useActiveShift } from "../hooks/useShift";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProductGrid } from "../components/menu/ProductGrid";
import { useCartStore } from "../stores/cart.store";
import { CartPanel } from "../components/cardPanel/CartPanel";
import { useCreateOrder } from "../hooks/useOrder";
import { PaymentModal } from "../components/reviewAndPayment/PaymentModal";
import { OrderSuccessModal } from "../components/reviewAndPayment/OrderSuccessModal";
import { OrderStatusEnum, PaymentMethodEnum } from "@/constants";
import { mapCartToCreateOrderDTO } from "../mappers/order.mapper";
import { OrderSnapshot } from "../models/order-snapshot";
import { ReviewOrderModal } from "../components/reviewAndPayment/ReviewOrderModal";
import { usePrintTicket } from "../hooks/usePrintTicket";
import { TicketPrint } from "../components/reviewAndPayment/TicketPrint";
import { useCreateSale } from "../../sales/hooks/useSale";
import { Sale } from "../../sales/models/sale";
import { CategoryProduct } from "../../catalog/categories/models/category.model";
import { CartPanelSkeleton } from "../components/cardPanel/CartPanelSkeleton";
import { useAuthStore } from "@/stores/auth.store";
import { useOfflineStore } from "@/features/offline/stores/offline.store";
import { offlineQueue } from "@/features/offline/services/offline-queue";
import { syncOfflineQueue } from "@/features/offline/services/offline-sync.service";
import {
  OFFLINE_PAYMENT_METHODS,
  buildOfflineSale,
  getOfflineIneligibility,
  mapQueuedSaleToSaleModel,
} from "@/features/offline/utils/offline-sale.builder";

export type PosView = "idle" | "review" | "payment" | "success" | "invoice";

export const Pos = () => {
  const {
    data: activeShift,
    isOpen,
    status: shiftStatus,
  } = useActiveShift();
  const user = useAuthStore((s) => s.user);
  const isOffline = useOfflineStore((s) => s.isOffline);

  const {
    items,
    orderType,
    orderChannel,
    customerName,
    customerPhone,
    customerAddress,
    deliveryReference,

    discount,
    addItem,
    getSubtotal,
    getTotal,
    removeItem,
    updateDiscount,
    clearCart,
  } = useCartStore();

  const {
    mutate: createOrder,
    status: createStatus,
    data: createdOrder,
  } = useCreateOrder();

  const {
    mutate: createSale,
    status: createSaleStatus,
    data: sale,
  } = useCreateSale();

  const { ticketRef, print } = usePrintTicket();

  const [view, setView] = useState<PosView>("idle");
  const [orderSnapshot, setOrderSnapshot] = useState<OrderSnapshot | null>(
    null,
  );
  /** El cobro en curso se registra como venta offline. */
  const [offlineCheckout, setOfflineCheckout] = useState(false);
  const [offlineSale, setOfflineSale] = useState<Sale | null>(null);
  const [savingOffline, setSavingOffline] = useState(false);

  // La ficha impresa y el modal de éxito muestran la última venta cobrada.
  const displayedSale = offlineSale ?? sale;

  /** Motivo por el que no se puede vender offline ahora, o null. */
  function offlineBlocker(): string | null {
    return getOfflineIneligibility({
      cartItems: items,
      orderType,
      shiftId: isOpen ? activeShift?.id : null,
      user,
    });
  }

  /** Pasa al cobro offline, o avisa por qué no se puede. */
  function startOfflineCheckout(): boolean {
    const blocker = offlineBlocker();
    if (blocker) {
      toast.error(`Sin conexión: ${blocker}`, { id: "offline-blocked" });
      return false;
    }
    setOfflineCheckout(true);
    setView("payment");
    return true;
  }

  function handleCheckout() {
    if (!items.length) return;
    if (isOffline) {
      const blocker = offlineBlocker();
      if (blocker) {
        toast.error(`Sin conexión: ${blocker}`, { id: "offline-blocked" });
        return;
      }
    }
    setOrderSnapshot({
      items: [...items],
      orderType,
      orderChannel,
      customerName,
      customerPhone,
      customerAddress,
      deliveryReference,

      subtotal: getSubtotal(),

      total: getTotal(),
    });

    setView("review");
  }

  function handleCreateOrder() {
    // Ya se sabe que no hay conexión: directo al cobro offline.
    if (isOffline) {
      startOfflineCheckout();
      return;
    }

    const dto = mapCartToCreateOrderDTO(
      items,
      orderType,
      orderChannel,
      customerName,
      customerPhone,
      customerAddress,
      deliveryReference,
      OrderStatusEnum.READY,
    );
    createOrder(dto, {
      onSuccess: () => {
        setOfflineCheckout(false);
        setView("payment");
      },
      // Falló el primer paso sin respuesta del servidor: el pedido no se
      // creó, así que es seguro ofrecer el cobro offline. (Si fallara
      // POST /sales no se convierte: la venta pudo haberse registrado.)
      onError: (error) => {
        if (error?.networkError) startOfflineCheckout();
      },
    });
  }

  // 2. Cajero confirma método de pago → cambia estado a PAID
  function handleConfirmPayment(
    method: PaymentMethodEnum,
    receivedAmount: number,
  ) {
    if (offlineCheckout) {
      void handleConfirmOfflinePayment(method, receivedAmount);
      return;
    }

    if (!createdOrder) return;

    createSale(
      {
        orderId: createdOrder.id,
        paymentMethod: method,
        receivedAmount,
        totalDiscount: discount,
      },
      {
        onSuccess: () => {
          setView("success");
          // Hay conexión: buen momento para vaciar la cola offline.
          void syncOfflineQueue();
        },
      },
    );
  }

  async function handleConfirmOfflinePayment(
    method: PaymentMethodEnum,
    receivedAmount: number,
  ) {
    const blocker = offlineBlocker();
    if (blocker || !user || !activeShift) {
      toast.error(`Sin conexión: ${blocker ?? "no hay turno abierto."}`);
      return;
    }

    setSavingOffline(true);
    try {
      const cart = useCartStore.getState();
      const queued = buildOfflineSale({
        cartItems: cart.items,
        orderType: cart.orderType,
        customerName: cart.customerName,
        paymentMethod: method,
        receivedAmount,
        discount: cart.discount,
        shiftId: activeShift.id,
        user,
      });
      await offlineQueue.add(queued);
      await useOfflineStore.getState().refresh();

      setOfflineSale(mapQueuedSaleToSaleModel(queued));
      clearCart();
      setView("success");
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? `No se pudo guardar la venta offline: ${error.message}`
          : "No se pudo guardar la venta offline en este equipo.",
      );
    } finally {
      setSavingOffline(false);
    }
  }

  // 4. Emitir factura
  function handleEmitInvoice() {
    setView("invoice");
  }

  // 6. Nuevo pedido
  function handleNewOrder() {
    clearCart();
    setOfflineCheckout(false);
    // Antes del próximo cobro: si no, el efecto de impresión de una venta en
    // línea podría tomar todavía la ficha offline anterior.
    setOfflineSale(null);
    setView("idle");
  }

  function handleClosePayment() {
    setOfflineCheckout(false);
    setView("idle");
  }

  function handleAddItem(product: CategoryProduct) {
    addItem(product);
  }

  useEffect(() => {
    if (sale && createSaleStatus === "success") {
      print();
    }
  }, [createSaleStatus, sale]);

  // Ficha de la venta offline: se imprime en cuanto se guarda en la cola.
  useEffect(() => {
    if (offlineSale) print();
  }, [offlineSale, print]);

  return (
    <div className="relative flex h-full overflow-hidden">
      {/* Modal turno — bloqueante */}
      {shiftStatus !== "pending" && !isOpen && <ShiftModal />}

      {displayedSale && (
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <TicketPrint ref={ticketRef} sale={displayedSale} />
        </div>
      )}
      {/* Left — catálogo */}
      <div className="flex-1 flex flex-col overflow-hidden bg-surface">
        <ProductGrid isOpen={isOpen} onAddItem={handleAddItem} />
      </div>

      {/* Right — carrito */}
      <div className="w-80 bg-white border-l border-surface flex flex-col flex-shrink-0">
        {shiftStatus === "pending" ? (
          <CartPanelSkeleton itemCount={3} />
        ) : (
          <CartPanel onCheckout={handleCheckout} />
        )}
      </div>

      {/* Modal: revision */}
      {view === "review" && orderSnapshot && (
        <ReviewOrderModal
          order={orderSnapshot}
          onClose={() => setView("idle")}
          onConfirm={handleCreateOrder}
          onRemoveItem={(productId) => {
            removeItem(productId);
            // Actualizar el snapshot también
            setOrderSnapshot((prev) =>
              prev
                ? {
                    ...prev,
                    items: prev.items.filter((i) => i.productId !== productId),
                  }
                : prev,
            );
          }}
          isLoading={createStatus === "pending"}
        />
      )}

      {/* Modal: pago */}
      {view === "payment" && orderSnapshot && (
        <PaymentModal
          clientName={customerName}
          getSubtotal={getSubtotal}
          getTotal={getTotal}
          discount={discount}
          onUpdateDiscount={updateDiscount}
          onConfirm={handleConfirmPayment}
          onClose={handleClosePayment}
          isLoading={
            offlineCheckout ? savingOffline : createSaleStatus === "pending"
          }
          offline={offlineCheckout}
          allowedMethods={offlineCheckout ? OFFLINE_PAYMENT_METHODS : undefined}
        />
      )}

      {/* Modal: éxito */}
      {view === "success" && displayedSale && (
        <OrderSuccessModal
          sale={displayedSale}
          customerName={orderSnapshot?.customerName ?? null}
          onEmitInvoice={handleEmitInvoice}
          onClose={handleNewOrder}
        />
      )}

      {/* Offcanvas: factura */}
      {/* {paidOrder && (
        <InvoiceOffcanvas
          order={paidOrder}
          isOpen={view === "invoice"}
          onClose={() => setView("success")}
          onSubmit={handleInvoiceSubmit}
          isLoading={false}
        />
      )} */}
    </div>
  );
};
