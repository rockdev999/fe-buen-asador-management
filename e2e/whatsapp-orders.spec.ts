/**
 * RF-04 Pedidos por WhatsApp — pruebas de caja negra.
 *
 * El "cliente" es simulado: la prueba envía al webhook los mensajes firmados
 * que enviaría Meta, el bot arma el pedido y la caja lo recibe en tiempo real
 * (SSE). Ningún mensaje sale a WhatsApp: sin WHATSAPP_TOKEN el backend solo
 * registra en el log lo que habría enviado.
 *
 * Técnica: prueba de transición de estados del pedido.
 *
 *   PENDING ──Aprobar──▶ CONFIRMED ──Preparar──▶ PREPARING ──Listo──▶ READY ──Cobrar──▶ PAID
 *      │                                                                │
 *      └──Rechazar (motivo)──▶ CANCELLED          (delivery) READY ──Entregado──▶ DELIVERED
 *
 * Bandeja: Pendientes = PENDING · En curso = CONFIRMED/PREPARING ·
 *          Listos = READY/DELIVERED · PAID y CANCELLED salen de la bandeja.
 *
 * Precondiciones: turno abierto del cajero y E2E_PRODUCT con stock (se cobra).
 */
import { expect, test, type APIRequestContext } from "@playwright/test";
import { WhatsappOrdersPage } from "./pages/WhatsappOrdersPage";
import { findMenuProduct, loginByApi } from "./support/api";
import { storageStateOf, users } from "./support/users";
import { hasWhatsappConfig, randomWaPhone, WhatsappCustomer } from "./support/whatsapp-bot";

test.use({ storageState: storageStateOf("cashier") });

const PRODUCT = process.env.E2E_PRODUCT ?? "Para Tres";

test.describe("RF-04 · Pedidos por WhatsApp", () => {
  test.skip(
    !hasWhatsappConfig(),
    "Falta WHATSAPP_APP_SECRET / WHATSAPP_PHONE_NUMBER_ID (ver e2e/README.md)",
  );

  let tray: WhatsappOrdersPage;
  let ids: { locationId: string; categoryId: string; productId: string };

  test.beforeAll(async ({ request }) => {
    const session = await loginByApi(request, users.cashier);
    ids = { locationId: session.locationId, ...(await findMenuProduct(request, session, PRODUCT)) };
  });

  test.beforeEach(async ({ page }) => {
    tray = new WhatsappOrdersPage(page);
    await tray.goto();
  });

  /** Un cliente nuevo (número y nombre únicos) que hace un pedido por el bot. */
  async function newOrder(
    request: APIRequestContext,
    delivery?: { address: string; reference?: string },
  ) {
    const customerName = `E2E WA ${Date.now().toString().slice(-6)}`;
    const customer = new WhatsappCustomer(request, randomWaPhone(), customerName);
    await customer.placeOrder({ ...ids, customerName, delivery });
    return customerName;
  }

  test("CP-WA-01 · un pedido del bot llega a 'Pendientes' en tiempo real", async ({
    request,
  }) => {
    // La página ya está abierta: el pedido debe aparecer por SSE, sin recargar.
    const customerName = await newOrder(request);

    const row = tray.row(customerName);
    await expect(row).toBeVisible({ timeout: 20_000 });
    await expect(row).toContainText(/#[0-9A-F]{8}/); // código corto que recibe el cliente
    await expect(tray.rowButton(customerName, "Aprobar")).toBeVisible();
    await expect(tray.rowButton(customerName, "Rechazar")).toBeVisible();

    // Limpieza: se rechaza para no dejarlo pendiente
    await tray.rowButton(customerName, "Rechazar").click();
    await tray.reasonInput.fill("Limpieza de prueba E2E");
    await tray.modalSubmit("Rechazar").click();
    await expect(row).toHaveCount(0);
  });

  test("CP-WA-02 · transición válida completa: PENDING → CONFIRMED → PREPARING → READY → PAID", async ({
    request,
  }) => {
    const customerName = await newOrder(request);
    await expect(tray.row(customerName)).toBeVisible({ timeout: 20_000 });

    // PENDING → CONFIRMED: pasa a "En curso"
    await tray.advance(customerName, "Aprobar");
    await expect(tray.row(customerName)).toHaveCount(0);
    await tray.openTab("En curso");
    await expect(tray.rowButton(customerName, "Preparar")).toBeVisible();

    // CONFIRMED → PREPARING: sigue en "En curso"
    await tray.advance(customerName, "Preparar");
    await expect(tray.rowButton(customerName, "Listo")).toBeVisible();

    // PREPARING → READY: pasa a "Listos" y se puede cobrar
    await tray.advance(customerName, "Listo");
    await tray.openTab("Listos");
    await expect(tray.rowButton(customerName, "Cobrar")).toBeVisible();
    // Para llevar: después de READY no hay paso "Entregado"
    await expect(tray.rowButton(customerName, "Entregado")).toHaveCount(0);

    // READY → PAID: cobro en efectivo exacto (sin monto → con tarjeta)
    await tray.rowButton(customerName, "Cobrar").click();
    await expect(tray.paymentHeading).toBeVisible();
    await tray.page.getByRole("button", { name: "Tarjeta", exact: true }).click();
    await tray.confirmPayment.click();
    await expect(tray.successHeading).toBeVisible({ timeout: 15_000 });
    await tray.closeSuccess.click();

    // PAID es final: sale de la bandeja
    await expect(tray.row(customerName)).toHaveCount(0);
  });

  test("CP-WA-03 · delivery: READY → DELIVERED con el paso 'Entregado'", async ({ request }) => {
    const customerName = await newOrder(request, {
      address: "Av. Prueba E2E #123",
      reference: "Portón verde",
    });
    await expect(tray.row(customerName)).toBeVisible({ timeout: 20_000 });

    await tray.advance(customerName, "Aprobar");
    await tray.openTab("En curso");
    await tray.advance(customerName, "Preparar");
    await tray.advance(customerName, "Listo");
    await tray.openTab("Listos");

    // Delivery: READY ofrece "Entregado" y también se puede cobrar
    await expect(tray.rowButton(customerName, "Cobrar")).toBeVisible();
    await tray.advance(customerName, "Entregado");

    // DELIVERED sigue en "Listos" (falta cobrar) y ya no ofrece otro paso
    await expect(tray.rowButton(customerName, "Cobrar")).toBeVisible();
    await expect(tray.rowButton(customerName, "Entregado")).toHaveCount(0);

    // DELIVERED ya no se puede cancelar: se cobra para cerrar el pedido
    await tray.rowButton(customerName, "Cobrar").click();
    await tray.page.getByRole("button", { name: "Tarjeta", exact: true }).click();
    await tray.confirmPayment.click();
    await expect(tray.successHeading).toBeVisible({ timeout: 15_000 });
  });

  test("CP-WA-04 · rechazar un pedido exige motivo y lo saca de la bandeja (PENDING → CANCELLED)", async ({
    request,
  }) => {
    const customerName = await newOrder(request);
    await expect(tray.row(customerName)).toBeVisible({ timeout: 20_000 });

    await tray.rowButton(customerName, "Rechazar").click();

    // Sin motivo (vacío o solo espacios) no se puede rechazar
    await expect(tray.modalSubmit("Rechazar")).toBeDisabled();
    await tray.reasonInput.fill("   ");
    await expect(tray.modalSubmit("Rechazar")).toBeDisabled();

    await tray.reasonInput.fill("No tenemos ese producto hoy");
    await expect(tray.modalSubmit("Rechazar")).toBeEnabled();
    await tray.modalSubmit("Rechazar").click();

    // CANCELLED es final: no está en ninguna pestaña
    await expect(tray.row(customerName)).toHaveCount(0);
    for (const tab of ["En curso", "Listos"] as const) {
      await tray.openTab(tab);
      await expect(tray.row(customerName)).toHaveCount(0);
    }
  });

  test("CP-WA-05 · el webhook rechaza mensajes con firma inválida (401)", async ({ request }) => {
    const intruder = new WhatsappCustomer(request, randomWaPhone(), "Intruso");

    const forged = await intruder.send({ reply: "act:start" }, `sha256=${"0".repeat(64)}`);
    expect(forged.status()).toBe(401);

    const unsigned = await intruder.send({ reply: "act:start" }, "");
    expect(unsigned.status()).toBe(401);
  });
});
