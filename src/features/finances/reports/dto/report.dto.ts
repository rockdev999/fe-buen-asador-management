import { IngredientUnitEnum, PaymentMethodEnum } from "@/constants";
import { UUID } from "@/types/common";

// Parámetros comunes de los 4 endpoints de /finances/reports/*.
// Las fechas van sin hora (YYYY-MM-DD): el backend las interpreta como días
// de Bolivia y dateTo incluye el día completo. Sin locationId = todas.
export interface ReportParams {
  dateFrom: string;
  dateTo: string;
  locationId?: UUID;
}

interface ReportBaseDTO {
  period: { from: string; to: string };
  /** null = todas las sucursales */
  location: { id: UUID; name: string } | null;
}

export interface SalesReportDTO extends ReportBaseDTO {
  totalSales: number;
  totalDiscount: number;
  netTotal: number;
  salesCount: number;
  averageTicket: number;
  /** Un registro por cada día del rango, incluidos los días sin ventas. */
  byDay: { date: string; total: number; salesCount: number }[];
  /** Siempre vienen los 3 métodos; percentage con 1 decimal. */
  byPaymentMethod: {
    method: PaymentMethodEnum;
    total: number;
    salesCount: number;
    percentage: number;
  }[];
  /** Top 10 ordenado por ingreso. */
  topProducts: {
    productId: UUID;
    productName: string;
    quantitySold: number;
    totalRevenue: number;
  }[];
}

export interface ExpensesSummaryReportDTO extends ReportBaseDTO {
  totalExpenses: number;
  expensesCount: number;
  byCategory: {
    categoryId: UUID;
    /** Código de categoría: SERVICES, PERSONNEL, … */
    categoryName: string;
    total: number;
    count: number;
  }[];
}

export interface PayrollSummaryReportDTO extends ReportBaseDTO {
  totalPayroll: number;
  paymentsCount: number;
  byEmployee: {
    employeeName: string;
    roleDescription: string | null;
    totalAmount: number;
    paymentsCount: number;
  }[];
}

export interface IngredientsReportDTO extends ReportBaseDTO {
  totalCost: number;
  items: {
    ingredientId: UUID;
    ingredientName: string;
    unit: IngredientUnitEnum;
    purchased: number;
    consumed: number;
    wasted: number;
    /** Con "Todas" es la suma de stock de todas las sucursales. */
    remaining: number;
    totalCost: number;
  }[];
}
