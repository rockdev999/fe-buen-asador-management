import { OrderEnum, OrderStatusEnum, OrderTypeEnum } from "@/constants";

export const ORDER_STATUS_COLORS: Record<OrderStatusEnum, string> = {
  [OrderStatusEnum.PAID]: "bg-green-50 text-green-700",
  [OrderStatusEnum.PENDING]: "bg-yellow-50 text-yellow-700",
  [OrderStatusEnum.CONFIRMED]: "bg-blue-50 text-blue-700",
  [OrderStatusEnum.PREPARING]: "bg-purple-50 text-purple-700",
  [OrderStatusEnum.READY]: "bg-orange-50 text-brand-dark",
  [OrderStatusEnum.DELIVERED]: "bg-teal-50 text-teal-700",
  [OrderStatusEnum.CANCELLED]: "bg-red-50 text-red-700",
};

export const ORDER_STATUS_LABELS: Record<OrderStatusEnum, string> = {
  [OrderStatusEnum.PAID]: "Pagado",
  [OrderStatusEnum.PENDING]: "Pendiente",
  [OrderStatusEnum.CONFIRMED]: "Confirmado",
  [OrderStatusEnum.PREPARING]: "Preparando",
  [OrderStatusEnum.READY]: "Listo",
  [OrderStatusEnum.DELIVERED]: "Entregado",
  [OrderStatusEnum.CANCELLED]: "Cancelado",
};

export const ORDER_STATUS_DOT_COLORS: Record<OrderStatusEnum, string> = {
  [OrderStatusEnum.PAID]: "#16a34a",
  [OrderStatusEnum.PENDING]: "#ca8a04",
  [OrderStatusEnum.CONFIRMED]: "#2563eb",
  [OrderStatusEnum.PREPARING]: "#9333ea",
  [OrderStatusEnum.READY]: "#FF4D00",
  [OrderStatusEnum.DELIVERED]: "#0d9488",
  [OrderStatusEnum.CANCELLED]: "#dc2626",
};

export const ORDER_TYPE_LABELS: Record<OrderTypeEnum, string> = {
  [OrderTypeEnum.DINE_IN]: "Presencial",
  [OrderTypeEnum.TAKEAWAY]: "Para llevar",
  [OrderTypeEnum.DELIVERY]: "Delivery",
};

export const ORDER_TYPE_COLORS: Record<OrderTypeEnum, string> = {
  [OrderTypeEnum.DINE_IN]:
    "bg-orange-50 text-brand-dark border border-brand-light",
  [OrderTypeEnum.TAKEAWAY]:
    "bg-green-50 text-green-700 border border-green-200",
  [OrderTypeEnum.DELIVERY]: "bg-blue-50 text-blue-700 border border-blue-200",
};

export const ORDER_TYPE_BORDER: Record<OrderTypeEnum, string> = {
  [OrderTypeEnum.DINE_IN]: "border-l-2 border-l-brand-light",
  [OrderTypeEnum.TAKEAWAY]: "border-l-2 border-l-green-400",
  [OrderTypeEnum.DELIVERY]: "border-l-2 border-l-blue-400",
};

export const ORDER_CHANNEL_LABELS: Record<OrderEnum, string> = {
  [OrderEnum.IN_STORE]: "Tienda",
  [OrderEnum.ONLINE]: "WhatsApp",
};

export const ORDER_CHANNEL_COLORS: Record<OrderEnum, string> = {
  [OrderEnum.IN_STORE]: "#FF4D00",
  [OrderEnum.ONLINE]: "#16a34a",
};
