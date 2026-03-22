export const QUERY_KEYS = {
  // Auth
  ME: ["me"],

  // Usuarios
  USERS: ["users"],
  USER: (id: string) => ["users", id],

  // Sucursales
  LOCATIONS: ["locations"],
  LOCATION: (id: string) => ["locations", id],

  // Productos
  PRODUCTS: ["products"],
  PRODUCT: (id: string) => ["products", id],
  CATEGORIES: ["categories"],
  CATEGORY: (id: string) => ["categories", id],
  MODIFIERS: ["modifiers"],

  // Inventario
  INVENTORY: ["inventory"],
  STOCK: (locationId: string) => ["inventory", "stock", locationId],
  KARDEX: (productId: string) => ["inventory", "kardex", productId],
  ALERTS_STOCK: ["inventory", "alert"],

  // Finanzas
  INCOMES: ["finance", "incomes"],
  EXPENSES: ["finance", "expenses"],
  INVOICES: ["finance", "invoices"],
  REPORTS: ["finance", "reports"],

  // POS
  ORDERS: ["orders"],
  ORDER: (id: string) => ["orders", id],

  // Caja
  CASH_SHIFTS: ["cash-shifts"],
  CASH_SHIFT: (id: string) => ["cash-shifts", id],
  CASH_SHIFT_ACTIVE: ["cash-shifts", "active"],

  // Dashboard
  DASHBOARD: ["dashboard"],
  DASHBOARD_SALES: ["dashboard", "sales"],
} as const;
