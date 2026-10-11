import { Audit } from "@/types/audit.types";
import { UUID } from "@/types/common";
import { JobPositionEnum } from "@/constants/enums/job-position.enum";

export interface PaySheetItem {
  employeeId: UUID;
  employeeName: string;
  positions: JobPositionEnum[] | null;
  dailyWage: number | null;
  paidToday: boolean;
  paidTodayAmount: number | null;
}

export interface PayrollPageItem {
  id: UUID;
  employeeName: string;
  roleDescription: string | null;
  amount: number;
  location: { id: UUID; name: string };
  registeredBy: { id: UUID; name: string };
  createdAt: Date;
}

export interface PayrollPayment {
  id: UUID;
  employeeId: UUID | null;
  employeeName: string;
  roleDescription: string | null;
  amount: number;
  notes: string | null;
  registeredBy: { id: UUID; name: string };
  location: { id: UUID; name: string };
  shiftId: UUID;
  expense: { id: UUID; amount: number };
  audit: Audit;
}

export interface PayrollReport {
  periodFrom: string;
  periodTo: string;
  location: { id: UUID; name: string };
  totalPayroll: number;
  paymentsCount: number;
  byEmployee: {
    employeeName: string;
    roleDescription: string | null;
    totalAmount: number;
    paymentsCount: number;
  }[];
}
