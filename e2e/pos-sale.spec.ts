/**
 * RF-03 Venta en el Punto de Venta — pruebas de caja negra.
 *
 * Técnicas:
 *  - Partición de equivalencia por tipo de pedido (datos del cliente exigidos):
 *      Presencial: ninguno · Para llevar: nombre · Delivery: nombre, teléfono y dirección
 *  - Valores límite del monto recibido en efectivo (total = precio del producto P):
 *      P − 0.01 (falta) · P (exacto) · P + 25 (vuelto 25.00)
 *  - Flujo completo (caso de uso): carrito → revisar → cobrar → pago registrado.
 *  - Caso negativo: producto sin stock → el pedido no se crea.
 *
 * Precondiciones: el cajero de prueba tiene un turno abierto y E2E_PRODUCT
 * tiene stock. CP-POS-08 a CP-POS-10 registran pedidos/ventas reales.
 */
import { expect, test } from "@playwright/test";
import { PosPage } from "./pages/PosPage";
import { storageStateOf } from "./support/users";

test.use({ storageState: storageStateOf("cashier") });

const PRODUCT = process.env.E2E_PRODUCT ?? "Para Tres";
const PRICE = Number(process.env.E2E_PRODUCT_PRICE ?? 275);
const NO_STOCK_PRODUCT = process.env.E2E_PRODUCT_NO_STOCK;
const PRODUCT_CATEGORY = process.env.E2E_PRODUCT_CATEGORY;

const money = (n: number) => new RegExp(`Bs\\.\\s*${n.toFixed(2).replace(".", "\\.")}`);

test.describe("RF-03 · Venta en el POS", () => {
  let pos: PosPage;

  test.beforeEach(async ({ page }) => {
    pos = new PosPage(page);
    await pos.goto();
    await pos.expectShiftOpen();
    // El POS muestra una categoría a la vez: abrir la del producto de prueba
    if (PRODUCT_CATEGORY) await pos.openCategory(PRODUCT_CATEGORY);
  });

  test.describe("Carrito", () => {
    test("CP-POS-01 · con el carrito vacío no se puede cobrar", async () => {
      await expect(pos.emptyCart).toBeVisible();
      await expect(pos.checkoutButton).toBeDisabled();
    });

    test("CP-POS-02 · agregar el mismo producto dos veces suma el subtotal", async ({
      page,
    }) => {
      await pos.addProduct(PRODUCT, 2);

      await expect(page.getByText(money(PRICE * 2)).first()).toBeVisible();
      await expect(pos.checkoutButton).toBeEnabled();
    });
  });

  test.describe("Partición de equivalencia · datos del cliente por tipo de pedido", () => {
    test.beforeEach(async () => {
      await pos.addProduct(PRODUCT);
    });

    test("CP-POS-03 · Presencial: se puede confirmar sin datos del cliente", async () => {
      await pos.selectOrderType("Presencial");
      await pos.openReview();

      await expect(pos.confirmOrder).toBeEnabled();
      await expect(pos.customerPhone).toHaveCount(0);
    });

    test("CP-POS-04 · Para llevar sin nombre: no se puede confirmar", async () => {
      await pos.selectOrderType("Para llevar");
      await pos.openReview();

      await expect(pos.confirmOrder).toBeDisabled();
      await expect(pos.incompleteFields).toBeVisible();
    });

    test("CP-POS-05 · Para llevar con nombre: se puede confirmar", async () => {
      await pos.selectOrderType("Para llevar");
      await pos.openReview();
      await pos.customerName.fill("Cliente E2E");

      await expect(pos.confirmOrder).toBeEnabled();
      await expect(pos.incompleteFields).toHaveCount(0);
    });

    test("CP-POS-06 · Delivery con datos incompletos: no se puede confirmar", async () => {
      await pos.selectOrderType("Delivery");
      await pos.openReview();

      // Solo nombre y teléfono, sin dirección
      await pos.customerName.fill("Cliente E2E");
      await pos.customerPhone.fill("70000000");

      await expect(pos.confirmOrder).toBeDisabled();
      await expect(pos.incompleteFields).toBeVisible();
    });

    test("CP-POS-07 · Delivery con nombre, teléfono y dirección: se puede confirmar", async () => {
      await pos.selectOrderType("Delivery");
      await pos.openReview();
      await pos.customerName.fill("Cliente E2E");
      await pos.customerPhone.fill("70000000");
      await pos.customerAddress.fill("Av. Prueba #123");

      await expect(pos.confirmOrder).toBeEnabled();
    });
  });

  test.describe("Flujo completo de cobro (crea datos reales)", () => {
    test("CP-POS-08 · valores límite del efectivo recibido", async ({ page }) => {
      await pos.addProduct(PRODUCT);
      await pos.selectOrderType("Presencial");
      await pos.openReview();
      await pos.confirmAndGoToPayment();
      await pos.selectPaymentMethod("Efectivo");

      // Sin monto: no se puede confirmar
      await expect(pos.confirmPayment).toBeDisabled();

      // Límite − 0.01 → falta 0.01
      await pos.receivedAmount.fill((PRICE - 0.01).toFixed(2));
      await expect(pos.changeBox("Falta")).toBeVisible();
      await expect(pos.confirmPayment).toBeDisabled();

      // Límite exacto → se puede cobrar, sin vuelto
      await pos.receivedAmount.fill(PRICE.toFixed(2));
      await expect(pos.changeBox("Cambio")).toBeVisible();
      await expect(pos.confirmPayment).toBeEnabled();

      // Por encima → vuelto de 25.00
      await pos.receivedAmount.fill(String(PRICE + 25));
      await expect(pos.changeBox("Vuelto")).toBeVisible();
      await expect(page.getByText(/25\.00/).last()).toBeVisible();
      await expect(pos.confirmPayment).toBeEnabled();

      // Se cobra para no dejar el pedido abierto en la base de datos
      await pos.confirmPayment.click();
      await expect(pos.successHeading).toBeVisible({ timeout: 15_000 });
    });

    test("CP-POS-09 · venta presencial en efectivo con vuelto se registra", async () => {
      await pos.addProduct(PRODUCT);
      await pos.selectOrderType("Presencial");
      await pos.openReview();
      await pos.confirmAndGoToPayment();
      await pos.selectPaymentMethod("Efectivo");
      await pos.receivedAmount.fill(String(PRICE + 25));
      await pos.confirmPayment.click();

      await expect(pos.successHeading).toBeVisible({ timeout: 15_000 });

      // "Nuevo pedido" deja el POS listo para el siguiente cliente
      await pos.newOrderButton.click();
      await expect(pos.emptyCart).toBeVisible();
      await expect(pos.checkoutButton).toBeDisabled();
    });

    test("CP-POS-10 · venta para llevar con tarjeta se registra sin monto recibido", async ({
      page,
    }) => {
      await pos.addProduct(PRODUCT);
      await pos.selectOrderType("Para llevar");
      await pos.openReview();
      await pos.customerName.fill("Cliente E2E Tarjeta");
      await pos.confirmAndGoToPayment();
      await pos.selectPaymentMethod("Tarjeta");

      await expect(pos.receivedAmount).toHaveCount(0);
      await expect(pos.confirmPayment).toBeEnabled();
      await pos.confirmPayment.click();

      await expect(pos.successHeading).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText("Cliente E2E Tarjeta").first()).toBeVisible();
    });
  });

  test("CP-POS-11 · producto sin stock: el pedido no se crea y se avisa al cajero", async ({
    page,
  }) => {
    test.skip(!NO_STOCK_PRODUCT, "Define E2E_PRODUCT_NO_STOCK para ejecutar este caso");

    await pos.addProduct(NO_STOCK_PRODUCT!);
    await pos.selectOrderType("Presencial");
    await pos.openReview();

    const response = page.waitForResponse(
      (r) => r.url().endsWith("/api/orders") && r.request().method() === "POST",
    );
    await pos.confirmOrder.click();

    expect((await response).status()).toBe(409);
    await expect(page.getByText("Algunos productos no tienen stock suficiente")).toBeVisible();
    await expect(pos.paymentHeading).toHaveCount(0);
    await expect(pos.reviewHeading).toBeVisible();
  });
});
