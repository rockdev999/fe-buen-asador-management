/**
 * RF-08, RF-09, RF-33, RF-34 · Catálogo desde la interfaz — caja negra.
 *
 * Técnicas:
 *  - Tabla de decisión rol × acción del catálogo (el gerente gestiona; el
 *    administrador solo cambia la disponibilidad).
 *  - Partición de equivalencia del precio: sin precio propio (usa el general)
 *    vs. con precio propio de la sucursal.
 *  - Caso de uso: el gerente quita "Disponible para venta" y el producto deja
 *    de ofrecerse en el POS.
 *  - Tiempo real: un cambio del catálogo llega al POS sin recargar (SSE).
 *
 * Los productos se crean por API con nombres únicos; la interfaz se verifica.
 */
import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { PosPage } from "./pages/PosPage";
import {
  createCategory,
  createProduct,
  locationIdByName,
  managerToken,
  setProductAvailability,
  uniqueName,
} from "./support/catalog-api";
import { storageStateOf, users } from "./support/users";

const CASHIER_LOCATION = users.cashier.location ?? "Casa Matriz";
const OTHER_LOCATION = process.env.E2E_OTHER_LOCATION ?? "E2E Norte";

async function setup(request: APIRequestContext) {
  const token = await managerToken(request);
  const here = await locationIdByName(request, token, CASHIER_LOCATION);
  const categoryName = uniqueName("E2E Cat");
  const category = await createCategory(request, token, categoryName, [here]);
  return { token, here, categoryId: category.id, categoryName };
}

/**
 * Abre el POS y espera a que el navegador tenga abierto el stream de eventos
 * (si el cambio ocurre antes de suscribirse, el evento no le llega).
 */
async function openPosWithStream(page: Page) {
  const streamOpen = page.waitForResponse((res) =>
    res.url().includes("/notifications/stream"),
  );
  const pos = new PosPage(page);
  await pos.goto();
  await streamOpen;
  return pos;
}

/** Busca en la tabla de productos (filtro de búsqueda de la pantalla). */
async function searchProduct(page: Page, name: string) {
  await page.getByPlaceholder(/Buscar/).fill(name);
  await page.getByPlaceholder(/Buscar/).press("Enter");
  return page.getByRole("row", { name: new RegExp(name) });
}

test.describe("RF-08 · Catálogo — permisos en la interfaz (tabla de decisión)", () => {
  test.describe("Gerente", () => {
    test.use({ storageState: storageStateOf("manager") });

    test("CP-CAT-01 · ve 'Nuevo producto' y 'Nueva categoría'", async ({ page }) => {
      await page.goto("/catalog/products");
      await expect(page.getByRole("button", { name: "Nuevo producto" })).toBeVisible();
      await page.goto("/catalog/categories");
      await expect(page.getByRole("button", { name: /Nueva categoría/ })).toBeVisible();
    });
  });

  test.describe("Administrador", () => {
    test.use({ storageState: storageStateOf("admin") });

    test("CP-CAT-02 · no ve 'Nuevo producto' ni 'Nueva categoría' (solo disponibilidad)", async ({
      page,
    }) => {
      await page.goto("/catalog/products");
      await expect(page.getByRole("heading", { name: "Productos" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Nuevo producto" })).toHaveCount(0);
      await page.goto("/catalog/categories");
      await expect(page.getByRole("button", { name: /Nueva categoría/ })).toHaveCount(0);
    });

    test("CP-CAT-03 · al hacer clic en un producto no se abre el formulario de edición", async ({
      page,
      request,
    }) => {
      const { token, here, categoryId } = await setup(request);
      const name = uniqueName("E2E Solo lectura");
      await createProduct(request, token, { name, price: 12, categoryId, locationIds: [here] });

      await page.goto("/catalog/products");
      const row = await searchProduct(page, name);
      await row.first().click();
      await expect(page.getByText("Editar producto", { exact: true })).toHaveCount(0);
    });
  });
});

test.describe("RF-33 · Precio por sucursal en la interfaz", () => {
  test.describe("Gerente · listado en 'todas las sucursales'", () => {
    test.use({ storageState: storageStateOf("manager") });

    test("CP-CAT-04 · muestra el precio general y el detalle de la sucursal con precio propio", async ({
      page,
      request,
    }) => {
      const { token, here, categoryId } = await setup(request);
      const other = await locationIdByName(request, token, OTHER_LOCATION);
      const name = uniqueName("E2E Precio");
      await createProduct(request, token, {
        name,
        price: 24,
        categoryId,
        locationIds: [here, other],
        locationPrices: [
          { locationId: here, price: null },
          { locationId: other, price: 25 },
        ],
      });

      await page.goto("/catalog/products");
      const row = await searchProduct(page, name);
      await expect(row).toContainText(/24\.00/);
      await expect(row).toContainText(new RegExp(`${OTHER_LOCATION}: .*25\\.00`));
    });
  });

  test.describe("Cajero · POS", () => {
    test.use({ storageState: storageStateOf("cashier") });

    test.beforeEach(async ({ page }) => {
      await new PosPage(page).goto();
    });

    test("CP-CAT-05 · sin precio propio, el POS muestra el precio general", async ({
      page,
      request,
    }) => {
      const { token, here, categoryId, categoryName } = await setup(request);
      const name = uniqueName("E2E General");
      await createProduct(request, token, { name, price: 18, categoryId, locationIds: [here] });

      await page.reload();
      const pos = new PosPage(page);
      await pos.openCategory(categoryName);
      await expect(pos.product(name)).toContainText("BOB 18.00");
    });

    test("CP-CAT-06 · con precio propio de su sucursal, el POS muestra ese precio", async ({
      page,
      request,
    }) => {
      const { token, here, categoryId, categoryName } = await setup(request);
      const name = uniqueName("E2E Propio");
      await createProduct(request, token, {
        name,
        price: 18,
        categoryId,
        locationIds: [here],
        locationPrices: [{ locationId: here, price: 21.5 }],
      });

      await page.reload();
      const pos = new PosPage(page);
      await pos.openCategory(categoryName);
      await expect(pos.product(name)).toContainText("BOB 21.50");
    });
  });
});

test.describe("RF-34 · El POS se actualiza solo (SSE catalog-updated)", () => {
  test.use({ storageState: storageStateOf("cashier") });

  test("CP-CAT-07 · si el gerente pone un producto como no disponible, desaparece del POS sin recargar", async ({
    page,
    request,
  }) => {
    const { token, here, categoryId, categoryName } = await setup(request);
    const name = uniqueName("E2E Tiempo real");
    // Producto de control: mantiene la categoría en el menú
    const control = uniqueName("E2E Control");
    await createProduct(request, token, { name: control, price: 5, categoryId, locationIds: [here] });
    const product = await createProduct(request, token, {
      name,
      price: 9,
      categoryId,
      locationIds: [here],
    });

    const pos = await openPosWithStream(page);
    await pos.openCategory(categoryName);
    await expect(pos.product(name)).toBeVisible();

    await setProductAvailability(request, token, product.id, false, here);
    // Sin recargar: llega el evento y el POS vuelve a pedir el menú
    await expect(pos.product(name)).toHaveCount(0, { timeout: 10_000 });
    await expect(pos.product(control)).toBeVisible();
  });

  test("CP-CAT-08 · si el gerente crea un producto en su sucursal, aparece en el POS sin recargar", async ({
    page,
    request,
  }) => {
    const { token, here, categoryId, categoryName } = await setup(request);
    const pos = await openPosWithStream(page);
    // Una categoría sin productos no aparece en el menú del POS
    await expect(pos.category(categoryName)).toHaveCount(0);

    const name = uniqueName("E2E Nuevo");
    await createProduct(request, token, { name, price: 7, categoryId, locationIds: [here] });
    // Sin recargar: aparece la categoría y, dentro, el producto
    await expect(pos.category(categoryName)).toBeVisible({ timeout: 10_000 });
    await pos.openCategory(categoryName);
    await expect(pos.product(name)).toBeVisible();
  });
});

test.describe("RF-09 · 'Disponible para venta' del formulario de producto", () => {
  test("CP-CAT-09 · el gerente lo desmarca y el producto deja de ofrecerse en el POS", async ({
    browser,
    request,
  }) => {
    const { token, here, categoryId, categoryName } = await setup(request);
    const name = uniqueName("E2E Disponible");
    const control = uniqueName("E2E Control");
    await createProduct(request, token, { name: control, price: 5, categoryId, locationIds: [here] });
    await createProduct(request, token, { name, price: 11, categoryId, locationIds: [here] });

    const managerCtx = await browser.newContext({ storageState: storageStateOf("manager") });
    const manager = await managerCtx.newPage();
    await manager.goto("/catalog/products");
    const row = await searchProduct(manager, name);
    await row.first().click();
    await expect(manager.getByText("Editar producto", { exact: true })).toBeVisible();
    await manager.getByText("Disponible para venta").click();
    await manager.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(manager.getByText("Editar producto", { exact: true })).toHaveCount(0);
    await managerCtx.close();

    const cashierCtx = await browser.newContext({ storageState: storageStateOf("cashier") });
    const cashier = await cashierCtx.newPage();
    const pos = new PosPage(cashier);
    await pos.goto();
    await pos.openCategory(categoryName);
    await expect(pos.product(control)).toBeVisible();
    await expect(pos.product(name)).toHaveCount(0);
    await cashierCtx.close();
  });
});
