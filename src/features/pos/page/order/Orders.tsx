import { useState } from "react";
import { ORDERS_COLUMNS, ORDERS_TABLE_CONFIG } from "./OrderColumns";
import { useGetOrderById, useOrdersPage } from "../../hooks/useOrder";
import { TableFilters } from "@/components/shared/DataTable/TableFilters";
import { DataTable } from "@/components/shared/DataTable/DataTable";
import { SortDirection } from "@/components/shared/DataTable/types";
import { PageHeader } from "@/components/shared/DataTable/PageHeader";
import { ORDER_DROPDOWNS } from "../../config/orders.table";
import { ReviewOrderModal } from "../../components/reviewAndPayment/ReviewOrderModal";
import { PosView } from "../Pos";
import { PaymentModal } from "../../components/reviewAndPayment/PaymentModal";
import { useCreateSale } from "../../../sales/hooks/useSale";
import { OrderSuccessModal } from "../../components/reviewAndPayment/OrderSuccessModal";
import { PaymentMethodEnum } from "@/constants";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ManagerOrders } from "./ManagerOrders";
import { useActiveShift } from "../../hooks/useShift";
import { toast } from "sonner";

export function Orders() {
  const { isManager } = useAuth();

  if (isManager) return <ManagerOrders />;

  return <CashierAdminOrders />;
}

// Vista operativa por sucursal (ADMIN/CASHIER) — usa el locationId del token.
function CashierAdminOrders() {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState(
    ORDERS_TABLE_CONFIG.defaultSorting.columnKey,
  );
  const [view, setView] = useState<PosView>("idle");
  const [sortDir, setSortDir] = useState<SortDirection>(
    ORDERS_TABLE_CONFIG.defaultSorting.direction,
  );
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [updateDiscount, setUpdateDiscount] = useState<number | null>(null);

  const navigate = useNavigate();
  const { isCashier } = useAuth();
  // El backend rechaza POST /sales sin turno OPEN (409 NO_ACTIVE_SHIFT);
  // al cajero se le avisa antes de abrir el cobro.
  const { isOpen: hasActiveShift } = useActiveShift(isCashier);

  const { data: selectedOrder } = useGetOrderById(selectedOrderId);
  const {
    mutate: createSale,
    status: createSaleStatus,
    data: sale,
  } = useCreateSale();

  const {
    data,
    meta,
    status: queryStatus,
    refetch,
  } = useOrdersPage({
    page,
    search: filters.search ?? "",
    status: filters.status ?? "",
    type: filters.type ?? "",
    channel: filters.channel ?? "",
    sortKey,
    sortDir,
  });

  function handleSort(key: string, dir: SortDirection) {
    setSortKey(dir ? key : "");
    setSortDir(dir);
    setPage(1);
  }

  function handleApply(newFilters: Record<string, string>) {
    // Con los mismos filtros la clave no cambia: se fuerza la recarga.
    const isSame = JSON.stringify(newFilters) === JSON.stringify(filters);
    setFilters(newFilters);
    setPage(1);
    if (isSame) refetch();
  }

  function handleCreateOrder() {
    if (isCashier && !hasActiveShift) {
      toast.warning("Necesitas un turno de caja abierto para cobrar");
      return;
    }
    setView("payment");
  }

  // El total se recalcula con el descuento que se ingresa en el modal de pago,
  // igual que hace el backend (total = subtotal − totalDiscount).
  const orderDiscount = updateDiscount ?? selectedOrder?.discount ?? 0;
  const orderTotal = Math.max(
    0,
    Math.round(((selectedOrder?.subtotal ?? 0) - orderDiscount) * 100) / 100,
  );

  function handleConfirmPayment(
    method: PaymentMethodEnum,
    receivedAmount: number,
  ) {
    if (!selectedOrder) return;

    createSale(
      {
        orderId: selectedOrder.id ?? "",
        paymentMethod: method,
        receivedAmount,
        totalDiscount: orderDiscount,
      },
      {
        onSuccess: () => {
          setView("success");
          setSelectedOrderId(null);
        },
      },
    );
  }

  // FASE 2 - Facturación
  // function handleEmitInvoice() {
  //   setView("invoice");
  // }

  function handleUpdateDiscount(discount: number) {
    setUpdateDiscount(discount);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-2xl">
      <PageHeader title="Pedidos" />

      <TableFilters
        searchPlaceholder="Buscar por cliente..."
        onApply={handleApply}
        dropdowns={ORDER_DROPDOWNS}
        initialValues={filters}
        isLoading={queryStatus === "pending"}
      />

      <DataTable
        columns={ORDERS_COLUMNS}
        data={data}
        meta={meta}
        isLoading={queryStatus === "pending"}
        onPageChange={(p) => setPage(p)}
        onSort={handleSort}
        sortKey={sortKey}
        sortDir={sortDir}
        onRowClick={(data) => {
          setView("review");
          setUpdateDiscount(null); // el descuento no pasa de un pedido a otro
          setSelectedOrderId(data.id);
        }}
        rowKey={(row) => row.id}
        emptyMessage="No hay pedidos"
        emptySubMessage="Intenta cambiar los filtros"
      />

      {view === "review" && selectedOrderId && selectedOrder && (
        <ReviewOrderModal
          order={selectedOrder}
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onConfirm={() => {
            handleCreateOrder();
          }}
          onOrderCancelled={() => setSelectedOrderId(null)}
          onRemoveItem={() => {}} // no-op para pedidos existentes
          isLoading={false}
          canCharge={isCashier}
        />
      )}
      {view === "payment" && selectedOrder && (
        <PaymentModal
          clientName={selectedOrder.customerName ?? ""}
          getSubtotal={() => selectedOrder.subtotal ?? 0}
          getTotal={() => orderTotal}
          discount={orderDiscount}
          onUpdateDiscount={handleUpdateDiscount}
          onConfirm={handleConfirmPayment}
          onClose={() => setView("idle")}
          isLoading={createSaleStatus === "pending"}
        />
      )}

      {/* Modal: éxito */}
      {view === "success" && sale && (
        <OrderSuccessModal
          sale={sale}
          customerName={selectedOrder?.customerName ?? null}
          // FASE 2 - Facturación
          // onEmitInvoice={handleEmitInvoice}
          onClose={() => {
            // Solo el cajero tiene POS; el admin se queda en Pedidos.
            if (isCashier) navigate(PATHS.POS);
            else setView("idle");
          }}
        />
      )}
    </div>
  );
}
