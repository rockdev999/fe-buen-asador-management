import { useCategoriesHandler } from "@/features/categories/hooks/useCategories";
import { ShiftModal } from "../components/ShiftModal";
import { useActiveShift } from "../hooks/useShift";
import { CategoryTabs } from "../components/CategoryTabs";
import { useState } from "react";
import { useProductsHandler } from "@/features/products/hooks/useProducts";
import { ProductGrid } from "../components/products/ProductGrid";
import { Product } from "@/features/products/models/product.model";
import { useCartStore } from "../stores/cart.store";
import { CartPanel } from "../components/CartPanel";
import {
  useCreateOrderInPerson,
  useUpdateOrderStatus,
} from "../hooks/useOrder";
import { PaymentModal } from "../components/PaymentModal";
import { OrderSuccessModal } from "../components/OrderSuccessModal";
import { InvoiceOffcanvas } from "../components/InvoiceOffcanvas";
import { OrderStatusEnum, PaymentMethodEnum } from "@/constants";
import { mapCartToCreateOrderInPersonDTO } from "../mappers/order.mapper";
import { Order } from "../models/order";

type PosView = "idle" | "payment" | "success" | "invoice";

export const Pos = () => {
  const { isOpen, status: shiftStatus } = useActiveShift();
  const { data: categories, status: catStatus } = useCategoriesHandler(isOpen);
  const { data: products, status: prodStatus } = useProductsHandler(isOpen);
  const { items, total, orderType, orderChannel, customerName, addItem } =
    useCartStore();

  const {
    mutate: createOrder,
    status: createStatus,
    data: createdOrder,
  } = useCreateOrderInPerson();
  const { mutate: updateStatus, status: updateOrderStatus } =
    useUpdateOrderStatus();

  const [showPayment, setShowPayment] = useState(false);

  const [view, setView] = useState<PosView>("idle");
  const [paidOrder, setPaidOrder] = useState<Order | null>(null);

  if (shiftStatus === "pending") {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  function handleCheckout() {
    if (!items.length) return;
    const dto = mapCartToCreateOrderInPersonDTO(
      items,
      orderType,
      orderChannel,
      customerName,
    );
    createOrder(dto, {
      onSuccess: () => setView("payment"),
    });
  }

  // 2. Cajero confirma método de pago → cambia estado a PAID
  function handleConfirmPayment(method: PaymentMethodEnum) {
    if (!createdOrder) return;
    updateStatus(
      { id: createdOrder.id, status: OrderStatusEnum.PAID },
      {
        onSuccess: (data) => {
          setPaidOrder(data);
          setView("success");
        },
      },
    );
  }

  // 3. Imprimir ticket
  function handlePrintTicket() {
    // TODO: react-thermal-printer
    console.log("Imprimir ticket", paidOrder);
  }

  // 4. Emitir factura
  function handleEmitInvoice() {
    setView("invoice");
  }

  // 5. Submit factura
  function handleInvoiceSubmit(nit: string, customerName: string) {
    // TODO: POST /invoices cuando esté listo el endpoint
    console.log("Emitir factura", {
      nit,
      customerName,
      orderId: paidOrder?.id,
    });
    setView("idle");
  }

  // 6. Nuevo pedido
  function handleNewOrder() {
    setPaidOrder(null);
    setView("idle");
  }

  function handleAddItem(product: Product) {
    addItem(product);
  }

  return (
    <div className="relative flex h-full overflow-hidden">
      {/* Left — catálogo */}
      <div className="flex-1 flex flex-col overflow-hidden bg-surface">
        {catStatus === "pending" || prodStatus === "pending" ? (
          <div className="flex items-center justify-center flex-1 text-sm text-muted-foreground">
            Cargando productos...
          </div>
        ) : (
          <ProductGrid
            categories={categories ?? []}
            products={products ?? []}
            onAddItem={handleAddItem}
          />
        )}
      </div>

      {/* Right — carrito */}
      <div className="w-80 bg-white border-l border-surface flex flex-col flex-shrink-0">
        <CartPanel onCheckout={handleCheckout} />
      </div>

      {/* Modal turno — bloqueante */}
      {!isOpen && <ShiftModal />}

      {/* Modal: pago */}
      {view === "payment" && (
        <PaymentModal
          total={total}
          onConfirm={handleConfirmPayment}
          onClose={() => setView("idle")}
          isLoading={updateOrderStatus === "pending"}
        />
      )}

      {/* Modal: éxito */}
      {view === "success" && paidOrder && (
        <OrderSuccessModal
          order={paidOrder}
          onPrintTicket={handlePrintTicket}
          onEmitInvoice={handleEmitInvoice}
          onClose={handleNewOrder}
        />
      )}

      {/* Offcanvas: factura */}
      {paidOrder && (
        <InvoiceOffcanvas
          order={paidOrder}
          isOpen={view === "invoice"}
          onClose={() => setView("success")}
          onSubmit={handleInvoiceSubmit}
          isLoading={false}
        />
      )}
    </div>
  );
};
