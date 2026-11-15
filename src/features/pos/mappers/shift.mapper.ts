import { ShiftCloseDTO, ShiftDTO, ShiftOpenDTO, ShiftSummaryDTO } from "../dto/shift.dto";
import { ShiftCloseForm, ShiftOpenForm } from "../forms/shift.form";
import { Shift, ShiftSummary } from "../models/shift";

export const mapShiftFormToDTO = (form: ShiftOpenForm): ShiftOpenDTO => ({
  initialAmount: form.initialAmount,
});

export const mapShiftCloseFormToDTO = (form: ShiftCloseForm): ShiftCloseDTO => {
  const notes = form.notes.trim();
  return {
    declaredAmount: form.declaredAmount ?? 0,
    ...(notes && { notes }),
  };
};

export const mapShiftDTOToModel = (dto: ShiftDTO): Shift => ({
  id: dto.id,
  location: { id: dto.location.id, name: dto.location.name },
  cashier: dto.cashier,
  openedAt: dto.openedAt,
  closedAt: dto.closedAt,
  initialAmount: Number(dto.initialAmount),
  declaredAmount: dto.declaredAmount === null ? null : Number(dto.declaredAmount),
  systemAmount: dto.systemAmount === null ? null : Number(dto.systemAmount),
  difference: dto.difference === null ? null : Number(dto.difference),
  notes: dto.notes ?? null,
  status: dto.status,
  review: dto.review
    ? {
        reviewedBy: dto.review.reviewedBy,
        reviewedAt: dto.review.reviewedAt,
        notes: dto.review.notes,
      }
    : null,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});

export const mapShiftSummaryDTOToModel = (dto: ShiftSummaryDTO): ShiftSummary => ({
  ...dto,
  initialAmount: Number(dto.initialAmount),
});
