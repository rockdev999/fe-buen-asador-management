export interface ShiftOpenForm {
  initialAmount: number;
}

export interface ShiftCloseForm {
  /** null hasta que el cajero ingrese el monto contado. */
  declaredAmount: number | null;
  notes: string;
}

export interface ShiftApproveForm {
  notes: string;
}
