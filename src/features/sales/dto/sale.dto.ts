import {
  OrderTypeEnum,
  PaymentMethodEnum,
  SaleStatusEnum,
  ShiftStatusEnum,
} from "@/constants";
import { LocationDTO } from "@/features/locations/dto/location.dto";
import { UserShortDTO } from "@/features/users/dto/user.dto";
import { ISODateTimeString, UUID } from "@/types/common";
import { OrderItemDTO } from "../../pos/dto/order.dto";
import { Audit } from "@/types/audit.types";

export interface CreateSaleDTO {
  orderId: UUID;
  paymentMethod: PaymentMethodEnum;
  receivedAmount: number;
  totalDiscount: number;
}

export interface AnnulSaleDTO {
  reason: string;
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
    // Se usa para deshabilitar la anulación de ventas de turnos no abiertos.
    status: ShiftStatusEnum;
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
  audit: Audit;
}

export interface SalePageItemDTO {
  id: UUID;
  ticketCode: UUID;
  customerName: string | null;
  status: SaleStatusEnum;
  total: number;
  paymentMethod: PaymentMethodEnum;
  cashier: UserShortDTO;
  createdAt: ISODateTimeString;
}

export interface ManagerSalePageItemDTO extends SalePageItemDTO {
  location: {
    id: UUID;
    name: string;
  };
}
