export enum OrderEnum {
  ONLINE = 'ONLINE',
  IN_STORE = 'IN_STORE',
}

export enum OrderStatusEnum {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum OrderItemStatusEnum {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  CANCELLED = 'CANCELLED',
}

export enum OrderTypeEnum {
  DINE_IN = 'DINE_IN',
  TAKEAWAY = 'TAKEAWAY',
  DELIVERY = 'DELIVERY',
}
