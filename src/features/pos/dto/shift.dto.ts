import { PaymentMethodEnum, ShiftStatusEnum } from "@/constants";
import { UserShortDTO } from "@/features/users/dto/user.dto";
import { ISODateTimeString, UUID } from "@/types/common";

export interface ShiftOpenDTO {
  initialAmount: number;
}

// POST /shifts/close — sucursal y cajero salen del token.
export interface ShiftCloseDTO {
  declaredAmount: number;
  /** Obligatorio si lo declarado no coincide con lo esperado (SHIFT_NOTES_REQUIRED). */
  notes?: string;
}

// POST /shifts/:id/approve — `notes` obligatorio si difference ≠ 0.
export interface ShiftApproveDTO {
  notes?: string;
}

export interface ShiftReviewDTO {
  reviewedBy: UserShortDTO;
  reviewedAt: ISODateTimeString;
  notes: string | null;
}

export interface ShiftDTO {
  id: UUID;
  location: { id: UUID; name: string };
  cashier: UserShortDTO;
  openedAt: ISODateTimeString;
  closedAt: ISODateTimeString | null;
  initialAmount: number;
  declaredAmount: number | null;
  systemAmount: number | null;
  difference: number | null;
  notes: string | null;
  status: ShiftStatusEnum;
  review: ShiftReviewDTO | null;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface ShiftSummaryCountDTO {
  count: number;
  total: number;
}

// GET /shifts/active/summary (CASHIER, expectedCash = null: cierre ciego)
// GET /shifts/:id/summary   (ADMIN/MANAGER, expectedCash calculado)
export interface ShiftSummaryDTO {
  shiftId: UUID;
  openedAt: ISODateTimeString;
  initialAmount: number;
  sales: ShiftSummaryCountDTO & {
    byPaymentMethod: ({ method: PaymentMethodEnum } & ShiftSummaryCountDTO)[];
    annulled: ShiftSummaryCountDTO;
  };
  expenses: ShiftSummaryCountDTO;
  payroll: ShiftSummaryCountDTO;
  pendingOrders: number;
  expectedCash: number | null;
}

export interface ShiftPageParams {
  page: number;
  limit: number;
  status?: ShiftStatusEnum;
  cashierId?: UUID;
  locationId?: UUID;
  dateFrom?: string;
  dateTo?: string;
}
