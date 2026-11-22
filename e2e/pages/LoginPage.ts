/** Page Object del login en dos pasos: credenciales → sucursal. */
import { expect, type Locator, type Page } from "@playwright/test";
import type { TestUser } from "../support/users";

const ROLE_LABELS = { manager: "Gerente", admin: "Administrador", cashier: "Cajero" };

export class LoginPage {
  readonly identifier: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly continueButton: Locator;
  readonly backToLogin: Locator;

  constructor(private readonly page: Page) {
    this.identifier = page.locator("#identifier");
    this.password = page.locator("#password");
    this.submit = page.getByRole("button", { name: "Ingresar" });
    this.continueButton = page.getByRole("button", { name: "Continuar" });
    this.backToLogin = page.getByRole("button", { name: "Volver al inicio de sesión" });
  }

  async goto() {
    await this.page.goto("/login", { timeout: 90_000 });
    await expect(this.identifier).toBeVisible({ timeout: 30_000 });
  }

  async fillCredentials(identifier: string, password: string) {
    await this.identifier.fill(identifier);
    await this.password.fill(password);
    await this.submit.click();
  }

  /** Botón de una sucursal en el paso 2, por nombre y rol. */
  locationOption(location: string, role: TestUser["role"]) {
    return this.page.getByRole("button", {
      name: new RegExp(`^${location}\\s+${ROLE_LABELS[role]}$`),
    });
  }

  async chooseLocation(location: string, role: TestUser["role"]) {
    await this.locationOption(location, role).click();
    await this.continueButton.click();
  }

  /** Login completo: credenciales, sucursal si corresponde y llegada al inicio. */
  async loginAs(user: TestUser) {
    await this.goto();
    await this.fillCredentials(user.identifier, user.password);
    if (user.location) await this.chooseLocation(user.location, user.role);
    await expect(this.page).toHaveURL(new RegExp(`${user.home}$`), { timeout: 15_000 });
  }
}
