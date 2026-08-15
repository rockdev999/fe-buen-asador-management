import { RoleEnum } from "@/constants";
import { PATHS } from "@/routes";
import {
  Archive,
  BarChart3,
  Boxes,
  Building2,
  ChefHat,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Package,
  Receipt,
  ShoppingBag,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";

export interface NavItem {
  label: string;
  path?: string;
  icon: React.ElementType;
  roles?: RoleEnum[];
  children?: NavItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "General",
    items: [
      {
        label: "Dashboard",
        path: PATHS.DASHBOARD,
        icon: LayoutDashboard,
        roles: [RoleEnum.MANAGER, RoleEnum.ADMIN],
      },
    ],
  },
  {
    title: "Administración",
    items: [
      {
        label: "Usuarios",
        path: PATHS.USERS,
        icon: Users,
        roles: [RoleEnum.MANAGER],
      },
      {
        label: "Sucursales",
        path: PATHS.LOCATIONS,
        icon: Building2,
        roles: [RoleEnum.MANAGER],
      },
      {
        label: "Catálogo",
        icon: ShoppingBag,
        roles: [RoleEnum.MANAGER, RoleEnum.ADMIN],
        children: [
          {
            label: "Productos",
            path: PATHS.PRODUCTS,
            icon: ShoppingBag,
            roles: [RoleEnum.MANAGER, RoleEnum.ADMIN],
          },
          {
            label: "Categorías",
            path: PATHS.CATEGORIES,
            icon: ClipboardList,
            roles: [RoleEnum.MANAGER, RoleEnum.ADMIN],
          },
          {
            label: "Modificadores",
            path: PATHS.MODIFIERS,
            icon: Package,
            roles: [RoleEnum.MANAGER, RoleEnum.ADMIN],
          },
        ],
      },
      {
        label: "Inventario",
        path: PATHS.INVENTORY,
        icon: Boxes,
        roles: [RoleEnum.MANAGER, RoleEnum.ADMIN],
      },
      {
        label: "Insumos",
        path: PATHS.INGREDIENTS,
        icon: ChefHat,
        roles: [RoleEnum.MANAGER, RoleEnum.ADMIN],
      },
    ],
  },
  {
    title: "Finanzas",
    items: [
      {
        label: "Egresos",
        path: PATHS.EXPENSES,
        icon: Wallet,
        roles: [RoleEnum.MANAGER, RoleEnum.ADMIN],
      },
      {
        label: "Nómina",
        path: PATHS.PAYROLL,
        icon: UserCheck,
        roles: [RoleEnum.MANAGER, RoleEnum.ADMIN],
      },
      {
        label: "Reportes",
        path: PATHS.REPORTS,
        icon: BarChart3,
        roles: [RoleEnum.MANAGER, RoleEnum.ADMIN],
      },
    ],
  },
  {
    title: "Operaciones",
    items: [
      {
        label: "Caja",
        path: PATHS.SHIFTS,
        icon: Archive,
        roles: [RoleEnum.CASHIER, RoleEnum.ADMIN],
      },
      {
        label: "Pedidos",
        path: PATHS.ORDERS,
        icon: ClipboardList,
        roles: [RoleEnum.CASHIER, RoleEnum.ADMIN, RoleEnum.MANAGER],
      },
      {
        label: "Ventas",
        path: PATHS.SALES,
        icon: Receipt,
        roles: [RoleEnum.CASHIER, RoleEnum.ADMIN, RoleEnum.MANAGER],
      },
    ],
  },
  {
    title: "POS",
    items: [
      {
        label: "Punto de Venta",
        path: PATHS.POS,
        icon: CreditCard,
        roles: [RoleEnum.CASHIER],
      },
      {
        label: "Egresos",
        path: PATHS.EXPENSES,
        icon: Wallet,
        roles: [RoleEnum.CASHIER],
      },
      {
        label: "Nómina",
        path: PATHS.PAYROLL,
        icon: UserCheck,
        roles: [RoleEnum.CASHIER],
      },
    ],
  },
];
