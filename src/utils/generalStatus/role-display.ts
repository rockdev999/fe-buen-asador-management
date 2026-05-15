import { RoleEnum } from "@/constants";

export const ROLE_LABELS: Record<RoleEnum, string> = {
  [RoleEnum.MANAGER]: "Gerente",
  [RoleEnum.ADMIN]: "Administrador",
  [RoleEnum.CASHIER]: "Cajero",
};

export const ROLE_COLORS: Record<RoleEnum, string> = {
  [RoleEnum.MANAGER]: "bg-purple-50 text-purple-700",
  [RoleEnum.ADMIN]: "bg-blue-50 text-blue-700",
  [RoleEnum.CASHIER]: "bg-green-50 text-green-700",
};
