/* eslint-disable @typescript-eslint/no-explicit-any */
export const QUERY_KEYS = {
  // Auth
  ME: ["me"],

  // Usuarios
  USERS: ["users"],
  USER: (id: string) => ["users", id],
  PAGINATION_USERS: (params: Record<string, any>) => [
    "users",
    "pagination",
    params,
  ],

  // Sucursales
  LOCATIONS: ["locations"],
  LOCATION: (id: string) => ["locations", id],
  LOCATION_SIMPLE: ["locations", "simple"],

  // Productos
  PRODUCTS: ["products"],
  PRODUCT: (id: string) => ["products", id],
  CATEGORIES: ["categories"],
  CATEGORY: (id: string) => ["categories", id],
  MODIFIERS: ["modifiers"],
  MODIFIER: (id: string) => ["modifiers", id],

  // Sales
  SALES: ["sales"],
  SALE: (id: string) => ["sales", id],
  PAGINATION_SALES: (params: Record<string, any>) => [
    "sales",
    "pagination",
    params,
  ],

  // Inventario
  INVENTORY: ["inventory"],
  STOCK: (locationId: string) => ["inventory", "stock", locationId],
  KARDEX: (productId: string) => ["inventory", "kardex", productId],
  STOCK_ALERTS: ["inventory", "alerts"],

  // Finanzas
  INCOMES: ["finances", "incomes"],
  EXPENSES: ["finances", "expenses"],
  INVOICES: ["finances", "invoices"],
  REPORTS: ["finances", "reports"],

  // POS — Órdenes
  ORDERS: ["orders"],
  ORDER: (id: string) => ["orders", id],

  // Turnos
  SHIFTS: ["shifts"],
  SHIFT: (id: string) => ["shifts", id],
  SHIFT_ACTIVE: ["shifts", "active"],

  // Dashboard
  DASHBOARD: ["dashboard"],
  DASHBOARD_SALES: ["dashboard", "sales"],

  // Menú
  MENU: ["menu"],
} as const;
