export interface ShiftOpenForm {
  initialAmount: number;
}

export interface ShiftCloseForm {
  // null hasta que el cajero ingrese el monto (0 es un valor válido).
  declaredCash: number | null;
  declaredQr: number | null;
  declaredBankTransfer: number | null;
  notes: string;
}

export interface ShiftApproveForm {
  notes: string;
}
