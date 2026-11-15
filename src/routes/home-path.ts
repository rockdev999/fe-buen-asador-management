import { RoleEnum } from "@/constants";
import { PATHS } from "./paths";

/** Pantalla de inicio según el rol, tras elegir sucursal o cambiar contraseña. */
export function getHomePath(role: RoleEnum | undefined | null): string {
  return role === RoleEnum.CASHIER ? PATHS.POS : PATHS.DASHBOARD;
}
