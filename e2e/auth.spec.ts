/**
 * RF-01 Autenticación — pruebas de caja negra.
 *
 * Técnica: partición de equivalencia sobre las credenciales y el rol.
 *   Clases inválidas: campos vacíos · contraseña incorrecta · usuario inexistente
 *   Clases válidas:   gerente (correo, sin sucursal) · administrador (usuario,
 *                     elige sucursal) · cajero (correo, elige sucursal → POS)
 */
import { expect, test } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";
import { users } from "./support/users";

test.describe("RF-01 · Inicio de sesión", () => {
  let login: LoginPage;

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    await login.goto();
  });

  test("CP-AUT-01 · campos vacíos muestran validaciones y no envían la petición", async ({
    page,
  }) => {
    let loginRequests = 0;
    page.on("request", (r) => {
      if (r.url().includes("/auth/login")) loginRequests++;
    });

    await login.submit.click();

    await expect(page.getByText("El usuario o correo es requerido.")).toBeVisible();
    await expect(page.getByText("La contraseña es requerida.")).toBeVisible();
    expect(loginRequests).toBe(0);
    await expect(page).toHaveURL(/\/login$/);
  });

  test("CP-AUT-02 · contraseña incorrecta muestra 'Credenciales inválidas'", async ({
    page,
  }) => {
    await login.fillCredentials(users.cashier.identifier, "ContraseñaIncorrecta1");

    await expect(page.getByText("Credenciales inválidas")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
    await expect(login.identifier).toBeVisible();
  });

  test("CP-AUT-03 · usuario inexistente no inicia sesión", async ({ page }) => {
    await login.fillCredentials("no.existe.e2e@buenasador.com", "Control123.");

    await expect(page.getByText("Credenciales inválidas")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("CP-AUT-04 · el gerente entra directo al dashboard sin elegir sucursal", async ({
    page,
  }) => {
    await login.fillCredentials(users.manager.identifier, users.manager.password);

    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Dashboard", level: 1 })).toBeVisible();
    await expect(login.continueButton).toHaveCount(0);
  });

  test("CP-AUT-05 · el administrador ingresa con nombre de usuario y elige sucursal", async ({
    page,
  }) => {
    const admin = users.admin;
    await login.fillCredentials(admin.identifier, admin.password);

    await expect(page.getByRole("heading", { name: "Seleccionar sucursal" })).toBeVisible();
    await login.chooseLocation(admin.location!, admin.role);

    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
  });

  test("CP-AUT-06 · el cajero elige su sucursal y llega al Punto de Venta", async ({
    page,
  }) => {
    const cashier = users.cashier;
    await login.fillCredentials(cashier.identifier, cashier.password);
    await login.chooseLocation(cashier.location!, cashier.role);

    await expect(page).toHaveURL(/\/pos$/, { timeout: 15_000 });
    await expect(page.getByRole("banner")).toContainText(cashier.location!);
  });

  test("CP-AUT-07 · 'Continuar' está deshabilitado hasta elegir una sucursal", async () => {
    const cashier = users.cashier;
    await login.fillCredentials(cashier.identifier, cashier.password);

    await expect(login.continueButton).toBeDisabled();
    await login.locationOption(cashier.location!, cashier.role).click();
    await expect(login.continueButton).toBeEnabled();
  });

  test("CP-AUT-08 · 'Volver al inicio de sesión' regresa al paso 1", async () => {
    const cashier = users.cashier;
    await login.fillCredentials(cashier.identifier, cashier.password);
    await expect(login.continueButton).toBeVisible();

    await login.backToLogin.click();

    await expect(login.identifier).toBeVisible();
    await expect(login.continueButton).toHaveCount(0);
  });

  test("CP-AUT-09 · sin sesión, una ruta protegida redirige al login", async ({ page }) => {
    await page.goto("/users");
    await expect(page).toHaveURL(/\/login$/);
  });
});
