const BASE = "/images/icons";

export const ICONS = {
  // Finanzas
  money: `${BASE}/money.svg`,
  invoice: `${BASE}/invoice.svg`,
  wallet: `${BASE}/wallet.svg`,

  // POS
  cart: `${BASE}/cart.svg`,
  pos: `${BASE}/pos.svg`,
  receipt: `${BASE}/receipt.svg`,

  // Inventario
  box: `${BASE}/box.svg`,
  stock: `${BASE}/stock.svg`,
  alert: `${BASE}/alert.svg`,

  // Turnos
  shift: `${BASE}/shift.svg`,
  clock: `${BASE}/clock.svg`,

  // Usuarios
  user: `${BASE}/user.svg`,
  users: `${BASE}/users.svg`,

  // Sucursales
  location: `${BASE}/location.svg`,
  building: `${BASE}/building.svg`,

  // Navegación
  dashboard: `${BASE}/dashboard.svg`,
  settings: `${BASE}/settings.svg`,

  // Acciones
  edit: `${BASE}/edit.svg`,
  delete: `${BASE}/delete.svg`,
  search: `${BASE}/search.svg`,
} as const;

export type IconName = keyof typeof ICONS;
