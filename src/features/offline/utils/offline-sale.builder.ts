import {
  OrderTypeEnum,
  PaymentMethodEnum,
  SaleStatusEnum,
  ShiftStatusEnum,
} from "@/constants";
import type { CartItem } from "@/features/pos/models/cart";
import type { Sale, SaleProductGroup } from "@/features/sales/models/sale";
import type { UserDetails } from "@/features/users/models/user.model";
import type {
  OfflineOrderType,
  OfflinePaymentMethod,
  OfflineSaleDTO,
  OfflineSaleItemDTO,
  QueuedOfflineSale,
} from "../dto/offline-sale.dto";

export const OFFLINE_ORDER_TYPES: OrderTypeEnum[] = [
  OrderTypeEnum.DINE_IN,
  OrderTypeEnum.TAKEAWAY,
];

export const OFFLINE_PAYMENT_METHODS: PaymentMethodEnum[] = [
  PaymentMethodEnum.CASH,
  PaymentMethodEnum.BANK_TRANSFER,
];

const MAX_ITEMS = 100;
const CUSTOMER_NAME_MAX = 150;
const NOTES_MAX = 500;

const toCents = (amount: number) => Math.round((Number(amount) || 0) * 100);
const fromCents = (cents: number) => cents / 100;

/**
 * Mismo formato que el backend más el marcador OFF:
 * `PREF-YYYYMMDD-OFF-XXXXXXXX` (solo A-Z, 0-9 y guiones).
 */
export function generateOfflineTicketCode(locationName: string): string {
  const prefix =
    locationName
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .substring(0, 4) || "POS";
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const unique = crypto
    .randomUUID()
    .replace(/-/g, "")
    .substring(0, 8)
    .toUpperCase();
  return `${prefix}-${date}-OFF-${unique}`;
}

interface EligibilityParams {
  cartItems: CartItem[];
  orderType: OrderTypeEnum;
  shiftId: string | null | undefined;
  user: UserDetails | null;
}

/** Motivo por el que no se puede vender offline, o null si se puede. */
export function getOfflineIneligibility({
  cartItems,
  orderType,
  shiftId,
  user,
}: EligibilityParams): string | null {
  if (!user?.locationId) return "No hay una sucursal seleccionada.";
  if (!shiftId)
    return "No hay un turno abierto guardado en este equipo. Sin conexión no se puede abrir turno.";
  if (!OFFLINE_ORDER_TYPES.includes(orderType))
    return "Sin conexión solo se puede vender para comer aquí o para llevar.";
  const units = cartItems.reduce((n, item) => n + item.units.length, 0);
  if (units === 0) return "El carrito está vacío.";
  if (units > MAX_ITEMS)
    return `Sin conexión se pueden registrar hasta ${MAX_ITEMS} unidades por venta.`;
  return null;
}

interface BuildParams {
  cartItems: CartItem[];
  orderType: OrderTypeEnum;
  customerName: string | null;
  paymentMethod: PaymentMethodEnum;
  receivedAmount: number;
  discount: number;
  shiftId: string;
  user: UserDetails;
}

/**
 * Arma la venta para la cola: un ítem por unidad del carrito, con sus propios
 * modificadores y notas. El total se calcula en centavos con la misma fórmula
 * que el backend: Σ (unitPrice + Σ extraPrice) × quantity − totalDiscount.
 */
export function buildOfflineSale({
  cartItems,
  orderType,
  customerName,
  paymentMethod,
  receivedAmount,
  discount,
  shiftId,
  user,
}: BuildParams): QueuedOfflineSale {
  if (!OFFLINE_PAYMENT_METHODS.includes(paymentMethod)) {
    throw new Error("Sin conexión solo se acepta efectivo o tarjeta.");
  }

  const items: OfflineSaleItemDTO[] = [];
  const lines: QueuedOfflineSale["display"]["lines"] = [];
  let subtotalCents = 0;

  for (const item of cartItems) {
    for (const unit of item.units) {
      const unitCents =
        toCents(item.price) +
        unit.modifiers.reduce((sum, m) => sum + toCents(m.extraPrice), 0);
      subtotalCents += unitCents;

      const notes = unit.notes?.trim().slice(0, NOTES_MAX) || undefined;
      items.push({
        productId: item.productId,
        quantity: 1,
        unitPrice: fromCents(toCents(item.price)),
        ...(notes && { notes }),
        ...(unit.modifiers.length > 0 && {
          modifiers: unit.modifiers.map((m) => ({
            modifierId: m.id as string,
            extraPrice: fromCents(toCents(m.extraPrice)),
          })),
        }),
      });
      lines.push({
        productId: item.productId,
        productName: item.name,
        modifierNames: unit.modifiers.map((m) => m.name),
        notes: notes ?? "",
        subtotal: fromCents(unitCents),
      });
    }
  }

  const discountCents = Math.min(Math.max(toCents(discount), 0), subtotalCents);
  const totalCents = subtotalCents - discountCents;
  const isCash = paymentMethod === PaymentMethodEnum.CASH;
  // Tarjeta: se cobra exacto. Efectivo: lo recibido (el modal ya exige que alcance).
  const receivedCents = isCash
    ? Math.max(toCents(receivedAmount), 0)
    : totalCents;
  if (receivedCents < totalCents) {
    throw new Error("El monto recibido no alcanza para cubrir el total.");
  }

  const trimmedName = customerName?.trim().slice(0, CUSTOMER_NAME_MAX);

  const dto: OfflineSaleDTO = {
    id: crypto.randomUUID(),
    ticketCode: generateOfflineTicketCode(user.locationName ?? ""),
    shiftId,
    occurredAt: new Date().toISOString(),
    orderType: orderType as OfflineOrderType,
    ...(trimmedName && { customerName: trimmedName }),
    paymentMethod: paymentMethod as OfflinePaymentMethod,
    receivedAmount: fromCents(receivedCents),
    ...(discountCents > 0 && { totalDiscount: fromCents(discountCents) }),
    total: fromCents(totalCents),
    items,
  };

  return {
    ...dto,
    userId: user.id,
    locationId: user.locationId!,
    status: "PENDING",
    attempts: 0,
    display: {
      locationName: user.locationName ?? "",
      cashierName: user.name,
      lines,
    },
  };
}

/**
 * Solo los campos del contrato: el backend rechaza campos de más con
 * OFFLINE_INVALID_DATA.
 */
export function toOfflineSaleDto(sale: QueuedOfflineSale): OfflineSaleDTO {
  return {
    id: sale.id,
    ticketCode: sale.ticketCode,
    shiftId: sale.shiftId,
    occurredAt: sale.occurredAt,
    orderType: sale.orderType,
    ...(sale.customerName && { customerName: sale.customerName }),
    paymentMethod: sale.paymentMethod,
    receivedAmount: sale.receivedAmount,
    ...(sale.totalDiscount && { totalDiscount: sale.totalDiscount }),
    total: sale.total,
    items: sale.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      ...(item.notes && { notes: item.notes }),
      ...(item.modifiers?.length && {
        modifiers: item.modifiers.map((m) => ({
          modifierId: m.modifierId,
          extraPrice: m.extraPrice,
        })),
      }),
    })),
  };
}

/** Convierte la venta en cola al modelo que usan el ticket y el modal de éxito. */
export function mapQueuedSaleToSaleModel(sale: QueuedOfflineSale): Sale {
  const groupMap = new Map<string, SaleProductGroup>();
  for (const line of sale.display.lines) {
    const group = groupMap.get(line.productId) ?? {
      productId: line.productId,
      name: line.productName,
      unitCount: 0,
      total: 0,
      units: [],
    };
    group.unitCount += 1;
    group.total = fromCents(toCents(group.total) + toCents(line.subtotal));
    group.units.push({
      modifierLabel:
        line.modifierNames.length > 0
          ? line.modifierNames.join(", ")
          : "Sin modificadores",
      subtotal: line.subtotal,
      notes: line.notes,
    });
    groupMap.set(line.productId, group);
  }

  const discount = sale.totalDiscount ?? 0;
  const isCash = sale.paymentMethod === PaymentMethodEnum.CASH;

  return {
    id: sale.id,
    ticketCode: sale.ticketCode,
    orderId: sale.id,
    customerName: sale.customerName ?? null,
    orderType: sale.orderType as OrderTypeEnum,
    status: SaleStatusEnum.CLOSED,
    location: { id: sale.locationId, name: sale.display.locationName },
    cashier: { id: sale.userId, name: sale.display.cashierName },
    shift: { id: sale.shiftId, status: ShiftStatusEnum.OPEN },
    subtotal: fromCents(toCents(sale.total) + toCents(discount)),
    totalDiscount: discount,
    total: sale.total,
    receivedAmount: sale.receivedAmount,
    change: isCash
      ? fromCents(toCents(sale.receivedAmount) - toCents(sale.total))
      : 0,
    paymentMethod: sale.paymentMethod as PaymentMethodEnum,
    details: [],
    groups: Array.from(groupMap.values()),
    annulmentReason: null,
    isOffline: true,
    priceMismatch: false,
    syncedAt: null,
    audit: {
      createdAt: sale.occurredAt,
      createdBy: null,
      updatedBy: null,
    },
  };
}
