import { ShiftStatusEnum } from "@/constants";

export const SHIFT_STATUS_LABELS: Record<ShiftStatusEnum, string> = {
  [ShiftStatusEnum.OPEN]: "Abierto",
  [ShiftStatusEnum.PENDING]: "Pendiente de aprobación",
  [ShiftStatusEnum.CLOSED]: "Cerrado",
};

export const SHIFT_STATUS_COLORS: Record<ShiftStatusEnum, string> = {
  [ShiftStatusEnum.OPEN]: "bg-green-50 text-green-700",
  [ShiftStatusEnum.PENDING]: "bg-amber-50 text-amber-700",
  [ShiftStatusEnum.CLOSED]: "bg-surface text-muted-foreground",
};

export const SHIFT_STATUS_OPTIONS = [
  { label: "Pendientes de aprobación", value: ShiftStatusEnum.PENDING },
  { label: "Abiertos", value: ShiftStatusEnum.OPEN },
  { label: "Cerrados", value: ShiftStatusEnum.CLOSED },
];

/** + sobrante, − faltante, 0 cuadra. */
export function differenceTone(difference: number | null): string {
  if (difference === null) return "text-muted-foreground";
  if (difference === 0) return "text-green-700";
  return difference > 0 ? "text-blue-700" : "text-red-600";
}

export function differenceLabel(difference: number | null): string {
  if (difference === null) return "—";
  if (difference === 0) return "Cuadra";
  return difference > 0 ? "Sobrante" : "Faltante";
}
