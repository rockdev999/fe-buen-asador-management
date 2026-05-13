import { PaymentMethodEnum, SaleStatusEnum } from "@/constants";

export const STATUS_STYLES: Record<SaleStatusEnum, string> = {
  [SaleStatusEnum.OPEN]: "bg-yellow-50 text-yellow-700",
  [SaleStatusEnum.CLOSED]: "bg-green-50 text-green-700",
  [SaleStatusEnum.ANNULLED]: "bg-red-50 text-red-600",
};

export const STATUS_LABELS: Record<SaleStatusEnum, string> = {
  [SaleStatusEnum.OPEN]: "Abierta",
  [SaleStatusEnum.CLOSED]: "Cobrada",
  [SaleStatusEnum.ANNULLED]: "Anulada",
};

export const PAYMENT_LABELS: Record<PaymentMethodEnum, string> = {
  [PaymentMethodEnum.CASH]: "Efectivo",
  [PaymentMethodEnum.BANK_TRANSFER]: "Transferencia",
  [PaymentMethodEnum.QR]: "QR",
};
