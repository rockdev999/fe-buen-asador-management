import {
  CreatePayrollDTO,
  PaySheetItemDTO,
  PayrollPageItemDTO,
  PayrollPaymentDTO,
  PayrollReportDTO,
} from "../dto/payroll.dto";
import {
  PaySheetItem,
  PayrollPageItem,
  PayrollPayment,
  PayrollReport,
} from "../models/payroll.model";
import { PayrollForm } from "../validators/payroll.schema";

export const mapPaySheetItemDTOToModel = (
  dto: PaySheetItemDTO,
): PaySheetItem => ({
  employeeId: dto.employeeId,
  employeeName: dto.employeeName,
  positions: dto.positions,
  dailyWage: dto.dailyWage,
  paidToday: dto.paidToday,
  paidTodayAmount: dto.paidTodayAmount,
});

export const mapPayrollPageItemDTOToModel = (
  dto: PayrollPageItemDTO,
): PayrollPageItem => ({
  id: dto.id,
  employeeName: dto.employeeName,
  roleDescription: dto.roleDescription,
  amount: dto.amount,
  registeredBy: dto.registeredBy,
  createdAt: new Date(dto.createdAt),
});

export const mapPayrollPaymentDTOToModel = (
  dto: PayrollPaymentDTO,
): PayrollPayment => ({
  id: dto.id,
  employeeName: dto.employeeName,
  roleDescription: dto.roleDescription,
  amount: dto.amount,
  notes: dto.notes,
  registeredBy: dto.registeredBy,
  location: dto.location,
  shiftId: dto.shift.id,
  expense: dto.expense,
  audit: dto.audit,
});

export const mapPayrollReportDTOToModel = (
  dto: PayrollReportDTO,
): PayrollReport => ({
  periodFrom: dto.period.from,
  periodTo: dto.period.to,
  location: dto.location,
  totalPayroll: dto.totalPayroll,
  paymentsCount: dto.paymentsCount,
  byEmployee: dto.byEmployee,
});

export const mapPayrollFormToDTO = (
  form: PayrollForm,
): CreatePayrollDTO => ({
  employeeName: form.employeeName.trim(),
  amount: form.amount,
  ...(form.roleDescription?.trim() && {
    roleDescription: form.roleDescription.trim(),
  }),
  ...(form.notes?.trim() && { notes: form.notes.trim() }),
});
