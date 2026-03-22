export const QUERY_KEYS = {
  // Auth
  ME: ["me"],

  // Usuarios
  USUARIOS: ["usuarios"],
  USUARIO: (id: string) => ["usuarios", id],

  // Sucursales
  SUCURSALES: ["sucursales"],
  SUCURSAL: (id: string) => ["sucursales", id],

  // Productos
  PRODUCTOS: ["productos"],
  PRODUCTO: (id: string) => ["productos", id],
  CATEGORIAS: ["categorias"],
  CATEGORIA: (id: string) => ["categorias", id],
  MODIFICADORES: ["modificadores"],

  // Inventario
  INVENTARIO: ["inventario"],
  STOCK: (sucursalId: string) => ["inventario", "stock", sucursalId],
  KARDEX: (productoId: string) => ["inventario", "kardex", productoId],
  ALERTAS_STOCK: ["inventario", "alertas"],

  // Finanzas
  INGRESOS: ["finanzas", "ingresos"],
  EGRESOS: ["finanzas", "egresos"],
  FACTURAS: ["finanzas", "facturas"],
  REPORTES: ["finanzas", "reportes"],

  // POS
  PEDIDOS: ["pedidos"],
  PEDIDO: (id: string) => ["pedidos", id],

  // Caja
  TURNOS: ["turnos"],
  TURNO: (id: string) => ["turnos", id],
  TURNO_ACTIVO: ["turnos", "activo"],

  // Dashboard
  DASHBOARD: ["dashboard"],
  DASHBOARD_VENTAS: ["dashboard", "ventas"],
} as const;
