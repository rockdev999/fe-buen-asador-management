import { PaymentMethodEnum, ShiftStatusEnum } from "@/constants";
import { UserShort } from "@/features/users/models/user.model";
import { ISODateTimeString, UUID } from "@/types/common";

export interface ShiftReview {
  reviewedBy: UserShort;
  reviewedAt: ISODateTimeString;
  notes: string | null;
}

export interface ShiftReconciliationItem {
  method: PaymentMethodEnum;
  declared: number | null;
  expected: number | null;
  difference: number | null;
}

export interface Shift {
  id: UUID;
  location: { id: UUID; name: string };
  cashier: UserShort;
  openedAt: ISODateTimeString;
  closedAt: ISODateTimeString | null;
  initialAmount: number;
  declaredAmount: number | null;
  systemAmount: number | null;
  difference: number | null;
  reconciliation: ShiftReconciliationItem[] | null;
  hasDifference: boolean | null;
  notes: string | null;
  status: ShiftStatusEnum;
  review: ShiftReview | null;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface ShiftSummaryCount {
  count: number;
  total: number | null;
}

export interface ShiftSummary {
  shiftId: UUID;
  openedAt: ISODateTimeString;
  initialAmount: number;
  sales: ShiftSummaryCount & {
    byPaymentMethod: ({ method: PaymentMethodEnum } & ShiftSummaryCount)[];
    annulled: ShiftSummaryCount;
  };
  expenses: ShiftSummaryCount;
  payroll: ShiftSummaryCount;
  pendingOrders: number;
  expectedCash: number | null;
}
