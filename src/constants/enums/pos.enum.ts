import { OrderEnum, OrderTypeEnum } from "./order.enum";
import { PaymentMethodEnum } from "./sale.enum";

export const ORDER_TYPE_OPTIONS = [
  {
    label: "Presencial",
    value: OrderTypeEnum.DINE_IN,
    channel: OrderEnum.IN_STORE,
  },
  {
    label: "Delivery",
    value: OrderTypeEnum.DELIVERY,
    channel: OrderEnum.ONLINE,
  },
  {
    label: "Para llevar",
    value: OrderTypeEnum.TAKEAWAY,
    channel: OrderEnum.IN_STORE,
  },
] as const;

export const PAYMENT_METHOD_OPTIONS = [
  { label: "Efectivo", value: PaymentMethodEnum.CASH },
  { label: "Tarjeta", value: PaymentMethodEnum.BANK_TRANSFER },
  { label: "QR", value: PaymentMethodEnum.QR },
] as const;
