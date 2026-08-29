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

  // Roles
  ROLES: ["roles"],
} as const;
