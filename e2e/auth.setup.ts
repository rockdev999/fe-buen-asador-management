/**
 * Inicia sesión una vez por rol y guarda la sesión (localStorage) para que
 * las demás pruebas empiecen ya autenticadas.
 */
import { test as setup } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";
import { storageStateOf, users } from "./support/users";

for (const user of Object.values(users)) {
  setup(`sesión de ${user.role}`, async ({ page }) => {
    // La primera carga de la corrida compila la app en Vite (arranque en frío)
    setup.setTimeout(120_000);
    await new LoginPage(page).loginAs(user);
    await page.context().storageState({ path: storageStateOf(user.role) });
  });
}
