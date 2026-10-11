import { Audit } from "@/types/audit.types";
import { ISODateTimeString, UUID } from "@/types/common";
import { JobPositionEnum } from "@/constants/enums/job-position.enum";

export interface PaySheetItemDTO {
  employeeId: UUID;
  employeeName: string;
  positions: JobPositionEnum[] | null;
  dailyWage: number | null;
  paidToday: boolean;
  paidTodayAmount: number | null;
}

export interface PayrollPageItemDTO {
  id: UUID;
  employeeName: string;
  roleDescription: string | null;
  amount: number;
  location: { id: UUID; name: string };
  registeredBy: { id: UUID; name: string };
  createdAt: ISODateTimeString;
}

export interface PayrollPaymentDTO {
  id: UUID;
  employee: { id: UUID } | null;
  employeeName: string;
  roleDescription: string | null;
  amount: number;
  notes: string | null;
  registeredBy: { id: UUID; name: string };
  location: { id: UUID; name: string };
  shift: { id: UUID };
  expense: { id: UUID; amount: number };
  audit: Audit;
}

export interface CreatePayrollDTO {
  employeeId?: string;
  employeeName: string;
  roleDescription?: string;
  amount: number;
  notes?: string;
}

export interface CreatePayrollBatchDTO {
  payments: CreatePayrollDTO[];
}

export interface PayrollReportDTO {
  period: { from: string; to: string };
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
