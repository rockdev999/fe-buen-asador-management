/** Usuarios de prueba (desde .env.e2e) y la sesión guardada de cada rol. */
import path from "path";

export type Role = "manager" | "admin" | "cashier";

export interface TestUser {
  role: Role;
  identifier: string;
  password: string;
  /** Sucursal a elegir en el paso 2 (el gerente no elige). */
  location?: string;
  /** Pantalla de inicio esperada tras el login. */
  home: string;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta ${name} en .env.e2e (ver .env.e2e.example)`);
  }
  return value;
}

export const users: Record<Role, TestUser> = {
  manager: {
    role: "manager",
    identifier: required("E2E_MANAGER_USER"),
    password: required("E2E_MANAGER_PASS"),
    home: "/dashboard",
  },
  admin: {
    role: "admin",
    identifier: required("E2E_ADMIN_USER"),
    password: required("E2E_ADMIN_PASS"),
    location: process.env.E2E_ADMIN_LOCATION ?? "Casa Matriz",
    home: "/dashboard",
  },
  cashier: {
    role: "cashier",
    identifier: required("E2E_CASHIER_USER"),
    password: required("E2E_CASHIER_PASS"),
    location: process.env.E2E_CASHIER_LOCATION ?? "Casa Matriz",
    home: "/pos",
  },
};

export const storageStateOf = (role: Role) =>
  path.join(import.meta.dirname, "..", ".auth", `${role}.json`);
