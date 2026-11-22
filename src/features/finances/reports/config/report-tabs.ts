import { ChefHat, Receipt, UserCheck, Wallet, type LucideIcon } from "lucide-react";
import { RoleEnum } from "@/constants";

export type ReportKind = "sales" | "expenses" | "payroll" | "ingredients";

/** Quién puede ver cada reporte (JSON y PDF). El backend responde 403 al resto. */
export const REPORT_ROLES: Record<ReportKind, RoleEnum[]> = {
  sales: [RoleEnum.MANAGER],
  expenses: [RoleEnum.MANAGER, RoleEnum.ADMIN],
  payroll: [RoleEnum.MANAGER, RoleEnum.ADMIN],
  ingredients: [RoleEnum.MANAGER],
};

/** Reporte general (los 4 juntos, solo PDF). */
export const SUMMARY_PDF_ROLES = [RoleEnum.MANAGER];

/** Roles que entran a la pantalla de Reportes. */
export const REPORTS_PAGE_ROLES = [RoleEnum.MANAGER, RoleEnum.ADMIN];

export interface ReportTab {
  key: ReportKind;
  label: string;
  icon: LucideIcon;
  /** Muestra el checkbox "Incluir detalle" para el PDF. */
  pdfDetail: boolean;
  /** Qué trae el PDF (tooltip del botón). */
  pdfContent: string;
}

export const REPORT_TABS: ReportTab[] = [
  {
    key: "sales",
    label: "Ventas",
    icon: Receipt,
    pdfDetail: false,
    pdfContent:
      "Resumen, ventas por día (o por mes), por método de pago y todos los productos vendidos",
  },
  {
    key: "expenses",
    label: "Gastos",
    icon: Wallet,
    pdfDetail: true,
    pdfContent: "Resumen, gastos por categoría y el detalle de cada gasto",
  },
  {
    key: "payroll",
    label: "Nómina",
    icon: UserCheck,
    pdfDetail: true,
    pdfContent: "Resumen, nómina por empleado y el detalle de cada pago",
  },
  {
    key: "ingredients",
    label: "Insumos",
    icon: ChefHat,
    pdfDetail: false,
    pdfContent: "Resumen y tabla por insumo: comprado, consumido, merma, stock actual y costo",
  },
];

export function tabsForRole(hasRole: (...roles: RoleEnum[]) => boolean) {
  return REPORT_TABS.filter((t) => hasRole(...REPORT_ROLES[t.key]));
}
