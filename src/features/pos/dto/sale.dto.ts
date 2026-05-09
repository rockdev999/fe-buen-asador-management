import { OrderTypeEnum, PaymentMethodEnum, SaleStatusEnum } from "@/constants";
import { LocationDTO } from "@/features/locations/dto/location.dto";
import { UserShortDTO } from "@/features/users/dto/user.dto";
import { ISODateTimeString, UUID } from "@/types/common";
import { OrderItemDTO } from "./order.dto";

export interface CreateSaleDTO {
  orderId: UUID;
  paymentMethod: PaymentMethodEnum;
  receivedAmount: number;
  totalDiscount: number;
}

export interface SaleDTO {
  id: UUID;
  ticketCode: string;
  customerName: string | null;
  orderType: OrderTypeEnum;
  status: SaleStatusEnum;
  location: LocationDTO;
  cashier: UserShortDTO;
  shift: {
    id: UUID;
  };
  order: {
    id: UUID;
  };
  subtotal: number;
  totalDiscount: number;
  total: number;
  receivedAmount: number;
  change: number;
  paymentMethod: PaymentMethodEnum;
  details:
    | (OrderItemDTO & {
        itemSubtotal: number;
      })[]
    | [];
  annulmentReason: string | null;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}
