import { ISODateTimeString, UUID } from "@/types/common";

interface LocationRefDTO {
  id: UUID;
  name: string;
}

// GET /finances/reports/dashboard[?locationId=...]
// MANAGER: sin locationId = todas las sucursales.
// ADMIN: siempre su sucursal (el backend ignora locationId).
export interface DashboardDTO {
  /** Hoy en Bolivia, "YYYY-MM-DD". */
  date: string;
  /** null = todas las sucursales */
  location: LocationRefDTO | null;
  today: {
    totalSales: number;
    salesCount: number;
    averageTicket: number;
    /** Incluye la nómina. */
    totalExpenses: number;
    /** totalSales - totalExpenses */
    balance: number;
  };
  /** Una fila por sucursal del alcance. */
  shifts: {
    location: LocationRefDTO;
    isOpen: boolean;
    /** null si la caja está cerrada */
    cashier: { id: UUID; name: string } | null;
    /** ISO en UTC */
    openedAt: ISODateTimeString | null;
  }[];
  /** "ready" incluye los entregados que esperan el cobro. */
  orders: { pending: number; preparing: number; ready: number; total: number };
  alerts: { products: number; ingredients: number; total: number };
  /** 7 días; el último es hoy. */
  last7Days: { date: string; total: number; salesCount: number }[];
  /** Solo MANAGER sin locationId; en otro caso null. */
  byLocation:
    | {
        location: LocationRefDTO;
        totalSales: number;
        salesCount: number;
        shiftOpen: boolean;
        alerts: number;
      }[]
    | null;
}
