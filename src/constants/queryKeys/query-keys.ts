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
  MODIFIER: (id: string) => ["modifiers", id],

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
} as const;
