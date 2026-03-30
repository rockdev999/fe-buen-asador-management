import { ShiftDTO, ShiftOpenDTO } from "../dto/shift.dto";
import { ShiftOpenForm } from "../forms/shift.form";
import { Shift } from "../models/shift";

export const mapShiftFormToDTO = (form: ShiftOpenForm): ShiftOpenDTO => ({
  initialAmount: form.initialAmount,
});

export const mapShiftDTOToModel = (dto: ShiftDTO): Shift => ({
  id: dto.id,
  location: dto.location,
  cashier: dto.cashier,
  openedAt: dto.openedAt,
  closedAt: dto.closedAt,
  initialAmount: dto.initialAmount,
  declaredAmount: dto.declaredAmount,
  systemAmount: dto.systemAmount,
  difference: dto.difference,
  status: dto.status,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});
