/**
 * RF-02 Control de acceso por rol — pruebas de caja negra.
 *
 * Técnica: tabla de decisión rol × ruta. Si el rol no tiene permiso, la app
 * redirige a su pantalla de inicio (cajero → /pos, resto → /dashboard).
 *
 * | Ruta               | Gerente | Administrador | Cajero |
 * |--------------------|---------|---------------|--------|
 * | /users             |   ✔     |  ✘ dashboard  | ✘ pos  |
 * | /locations         |   ✔     |  ✘ dashboard  | ✘ pos  |
 * | /reports           |   ✔     |  ✘ dashboard  | ✘ pos  |
 * | /catalog/products  |   ✔     |      ✔        | ✘ pos  |
 * | /inventory         |   ✔     |      ✔        | ✘ pos  |
 * | /dashboard         |   ✔     |      ✔        | ✘ pos  |
 * | /sales             |   ✔     |      ✔        |   ✔    |
 * | /pos               | ✘ dash. |  ✘ dashboard  |   ✔    |
 */
import { expect, test } from "@playwright/test";
import { storageStateOf, type Role } from "./support/users";

type Rule = { path: string; allowed: Record<Role, boolean> };

const RULES: Rule[] = [
  { path: "/users", allowed: { manager: true, admin: false, cashier: false } },
  { path: "/locations", allowed: { manager: true, admin: false, cashier: false } },
  { path: "/reports", allowed: { manager: true, admin: false, cashier: false } },
  { path: "/catalog/products", allowed: { manager: true, admin: true, cashier: false } },
  { path: "/inventory", allowed: { manager: true, admin: true, cashier: false } },
  { path: "/dashboard", allowed: { manager: true, admin: true, cashier: false } },
  { path: "/sales", allowed: { manager: true, admin: true, cashier: true } },
  { path: "/pos", allowed: { manager: false, admin: false, cashier: true } },
];

const HOME: Record<Role, string> = {
  manager: "/dashboard",
  admin: "/dashboard",
  cashier: "/pos",
};

const ROLE_NAMES: Record<Role, string> = {
  manager: "Gerente",
  admin: "Administrador",
  cashier: "Cajero",
};

let n = 0;
for (const role of ["manager", "admin", "cashier"] as Role[]) {
  test.describe(`RF-02 · ${ROLE_NAMES[role]}`, () => {
    test.use({ storageState: storageStateOf(role) });

    for (const { path, allowed } of RULES) {
      const id = `CP-PER-${String(++n).padStart(2, "0")}`;
      const can = allowed[role];

      test(`${id} · ${path} → ${can ? "permitido" : `redirige a ${HOME[role]}`}`, async ({
        page,
      }) => {
        await page.goto(path);
        await expect(page).toHaveURL(new RegExp(`${can ? path : HOME[role]}$`));
      });
    }
  });
}
