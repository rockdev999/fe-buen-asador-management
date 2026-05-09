import { OrderTypeEnum, PaymentMethodEnum, SaleStatusEnum } from "@/constants";
import { Location } from "@/features/locations/models/location.model";
import { UserShort } from "@/features/users/models/user.model";
import { UUID } from "@/types/common";
import { OrderSaleItem } from "./order";

export interface SaleProductUnit {
  modifierLabel: string;
  subtotal: number;
  notes: string;
}

export interface SaleProductGroup {
  productId: string;
  name: string;
  unitCount: number;
  total: number;
  units: SaleProductUnit[];
}

export interface Sale {
  id: UUID;
  ticketCode: string;
  customerName: string | null;
  orderType: OrderTypeEnum;
  status: SaleStatusEnum;
  location: Location;
  cashier: UserShort;
  subtotal: number;
  totalDiscount: number;
  total: number;
  receivedAmount: number;
  change: number;
  paymentMethod: PaymentMethodEnum;
  details: OrderSaleItem[] | [];
  groups: SaleProductGroup[] | [];
  annulmentReason: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}
