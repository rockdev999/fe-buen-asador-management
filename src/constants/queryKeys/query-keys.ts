/* eslint-disable @typescript-eslint/no-explicit-any */
export const QUERY_KEYS = {
  // Auth
  ME: ["me"],
  MY_LOCATIONS: ["auth", "my-locations"],

  // Usuarios
  USERS: ["users"],
  USER: (id: string) => ["user-detail", id],
  USER_SIMPLE: ["users", "simple"],
  PAGINATION_USERS: (params: Record<string, any>) => [
    "users",
    "pagination",
    params,
  ],

  // Sucursales
  LOCATIONS: ["locations"],
  REMOVE_USER_FROM_LOCATION: (locationId: string, userId: string) => [
    locationId,
    userId,
  ],
  LOCATION: (id: string) => ["locations", id],
  PAGINATION_LOCATIONS: (params: Record<string, any>) => [
    "locations",
    "pagination",
    params,
  ],
  LOCATION_SIMPLE: ["locations", "simple"],

  // Productos
  PRODUCTS: ["products"],
  PRODUCT: (id: string) => ["products", id],
  CATEGORIES: ["categories"],
  // Prefijo común ["categories"]: invalidar CATEGORIES refresca ambas.
  // Antes compartían la misma key con formas distintas y se pisaban la caché.
  CATEGORIES_LIST: (locationId: string | null) => [
    "categories",
    "list",
    locationId ?? "all",
  ],
  CATEGORIES_SIMPLE: ["categories", "simple"],
  CATEGORY: (id: string) => ["categories", id],
  MODIFIERS: ["modifiers"],
  MODIFIER: (id: string) => ["modifiers", id],
  PAGINATION_PRODUCTS: (params: Record<string, any>) => [
    "products",
    "pagination",
    params,
  ],

  // Sales
  SALES: ["sales"],
  SALE: (id: string) => ["sales", id],
  PAGINATION_SALES: (params: Record<string, any>) => [
    "sales",
    "pagination",
    params,
  ],
  PAGINATION_SALES_MANAGER: (params: Record<string, any>) => [
    "sales",
    "manager",
    "pagination",
    params,
  ],

  // Inventario
  INVENTORY: ["inventory"],
  STOCK: (locationId: string) => ["inventory", "stock", locationId],
  KARDEX: (productId: string) => ["inventory", "kardex", productId],
  STOCK_ALERTS: ["inventory", "alerts"],

  // Insumos
  INGREDIENTS: ["ingredients"],
  INGREDIENT: (id: string) => ["ingredients", id],
  INGREDIENTS_SIMPLE: ["ingredients", "simple"],
  PAGINATION_INGREDIENTS: (params: Record<string, any>) => [
    "ingredients",
    "pagination",
    params,
  ],
  INGREDIENT_STOCK: (locationId: string) => [
    "ingredients",
    "stock",
    locationId,
  ],
  INGREDIENT_KARDEX: (ingredientId: string) => [
    "ingredients",
    "kardex",
    ingredientId,
  ],
  INGREDIENT_STOCK_ALERTS: ["ingredients", "alerts"],
  RECIPES: ["ingredients", "recipes"],
  RECIPES_BY_PRODUCT: (productId: string) => [
    "ingredients",
    "recipes",
    "product",
    productId,
  ],

  // Finanzas
  INCOMES: ["finances", "incomes"],
  EXPENSES: ["finances", "expenses"],
  EXPENSE: (id: string) => ["finances", "expenses", id],
  EXPENSE_CATEGORIES: ["finances", "expenses", "categories"],
  PAGINATION_EXPENSES: (params: Record<string, any>) => [
    "finances",
    "expenses",
    "pagination",
    params,
  ],
  EXPENSES_REPORT: (params: Record<string, any>) => [
    "finances",
    "reports",
    "expenses",
    params,
  ],
  PAYROLL: (params: Record<string, any>) => ["finances", "payroll", params],
  PAYROLL_DETAIL: (id: string) => ["finances", "payroll", id],
  PAYROLL_PAY_SHEET: (locationId: string) => [
    "finances",
    "payroll",
    "pay-sheet",
    locationId,
  ],
  PAGINATION_PAYROLL: (params: Record<string, any>) => [
    "finances",
    "payroll",
    "pagination",
    params,
  ],
  PAYROLL_REPORT: (params: Record<string, any>) => [
    "finances",
    "reports",
    "payroll",
    params,
  ],
  INVOICES: ["finances", "invoices"],
  REPORTS: ["finances", "reports"],
  // Reportes del gerente (pantalla Reportes): ["reports", "sales", params]
  REPORT: (
    kind: "sales" | "expenses" | "payroll" | "ingredients",
    params: Record<string, any>,
  ) => ["reports", kind, params],

  // POS — Órdenes
  ORDERS: ["orders"],
  ORDER: (id: string) => ["orders", id],
  PAGINATION_ORDERS_MANAGER: (params: Record<string, any>) => [
    "orders",
    "manager",
    "pagination",
    params,
  ],

  // Turnos
  SHIFTS: ["shifts"],
  SHIFT: (id: string) => ["shifts", id],
  // Prefijo de SHIFT_ACTIVE_SUMMARY: invalidar el turno activo refresca su resumen.
  SHIFT_ACTIVE: ["shifts", "active"],
  SHIFT_ACTIVE_SUMMARY: ["shifts", "active", "summary"],
  SHIFT_SUMMARY: (id: string) => ["shifts", id, "summary"],
  PAGINATION_SHIFTS: (params: Record<string, any>) => [
    "shifts",
    "page",
    params,
  ],

  // Dashboard
  // Prefijo ["dashboard"]: invalidar DASHBOARD refresca todas las sucursales.
  DASHBOARD: ["dashboard"],
  DASHBOARD_BY_LOCATION: (locationId: string | null) => [
    "dashboard",
    locationId ?? "all",
  ],

  // Menú
  MENU: ["menu"],

  // Roles
  ROLES: ["roles"],
} as const;
