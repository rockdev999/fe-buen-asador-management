import { RoleEnum } from "@/constants";
import { PATHS } from "@/routes";
import {
  Archive,
  Building2,
  CreditCard,
  DollarSign,
  FileText,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";
import { t } from "../../locales/es";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles?: RoleEnum[];
}

export const NAV_SECTIONS = [
  {
    title: t.sidebar.general.title,
    items: [
      {
        label: t.sidebar.general.dashboard,
        path: PATHS.DASHBOARD,
        icon: LayoutDashboard,
      },
    ] as NavItem[],
  },
  {
    title: t.sidebar.management.title,
    items: [
      {
        label: t.sidebar.management.users,
        path: PATHS.USERS,
        icon: Users,
        roles: [RoleEnum.MANAGER],
      },
      {
        label: t.sidebar.management.locations,
        path: PATHS.LOCATIONS,
        icon: Building2,
        roles: [RoleEnum.MANAGER],
      },
      {
        label: t.sidebar.management.products,
        path: PATHS.PRODUCTS,
        icon: ShoppingBag,
        roles: [RoleEnum.MANAGER, RoleEnum.ADMIN],
      },
      {
        label: t.sidebar.management.inventory,
        path: PATHS.INVENTORY,
        icon: Package,
        roles: [RoleEnum.MANAGER, RoleEnum.ADMIN],
      },
      {
        label: t.sidebar.management.finances,
        path: PATHS.FINANCES,
        icon: DollarSign,
        roles: [RoleEnum.MANAGER, RoleEnum.ADMIN],
      },
    ] as NavItem[],
  },
  {
    title: t.sidebar.cashier.title,
    items: [
      {
        label: t.sidebar.cashier.pos,
        path: PATHS.POS,
        icon: CreditCard,
        roles: [RoleEnum.CASHIER],
      },
      {
        label: t.sidebar.cashier.title,
        path: PATHS.CASHIER,
        icon: Archive,
        roles: [RoleEnum.CASHIER, RoleEnum.ADMIN],
      },
      {
        label: t.sidebar.cashier.invoices,
        path: PATHS.INVOICES,
        icon: FileText,
        roles: [RoleEnum.CASHIER, RoleEnum.ADMIN],
      },
    ] as NavItem[],
  },
];
