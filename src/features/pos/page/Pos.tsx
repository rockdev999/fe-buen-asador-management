import { ShiftModal } from "../components/ShiftModal";
import { useActiveShift } from "../hooks/useShift";
import { useEffect, useState } from "react";
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
// import { Sale } from "../models/sale";
import { CategoryProduct } from "../../catalog/categories/models/category.model";
import { CartPanelSkeleton } from "../components/cardPanel/CartPanelSkeleton";

export type PosView = "idle" | "review" | "payment" | "success" | "invoice";

export const Pos = () => {
  const { isOpen, status: shiftStatus } = useActiveShift();

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

  function handleCheckout() {
    if (!items.length) return;
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
        setView("payment");
      },
    });
  }

  // 2. Cajero confirma método de pago → cambia estado a PAID
  function handleConfirmPayment(method: PaymentMethodEnum) {
    if (!createdOrder) return;

    createSale(
      {
        orderId: createdOrder.id,
        paymentMethod: method,
        receivedAmount: getTotal(),
        totalDiscount: discount,
      },
      {
        onSuccess: () => {
          setView("success");
        },
      },
    );
  }

  // 4. Emitir factura
  function handleEmitInvoice() {
    setView("invoice");
  }

  // 6. Nuevo pedido
  function handleNewOrder() {
    // setPaidOrder(null);
    clearCart();
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

  return (
    <div className="relative flex h-full overflow-hidden">
      {/* Modal turno — bloqueante */}
      {!isOpen && <ShiftModal />}

      {sale && (
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <TicketPrint ref={ticketRef} sale={sale} />
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
          onClose={() => setView("idle")}
          isLoading={createSaleStatus === "pending"}
        />
      )}

      {/* Modal: éxito */}
      {view === "success" && sale && (
        <OrderSuccessModal
          sale={sale}
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
