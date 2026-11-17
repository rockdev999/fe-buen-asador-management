/** Page Object de la bandeja de pedidos de WhatsApp (caja). */
import { expect, type Locator, type Page } from "@playwright/test";

export type TrayTab = "Pendientes" | "En curso" | "Listos";

export class WhatsappOrdersPage {
  // Modal de rechazo / cancelación
  readonly reasonInput: Locator;

  // Cobro (mismos modales que el POS)
  readonly paymentHeading: Locator;
  readonly confirmPayment: Locator;
  readonly successHeading: Locator;
  readonly closeSuccess: Locator;

  constructor(readonly page: Page) {
    this.reasonInput = page.getByPlaceholder("Ej: Nos quedamos sin lechón");
    this.paymentHeading = page.getByRole("heading", { name: "Registrar cobro" });
    this.confirmPayment = page.getByRole("button", { name: "Confirmar cobro" });
    this.successHeading = page.getByRole("heading", { name: "¡Pago registrado!" });
    this.closeSuccess = page.getByRole("button", { name: "Cerrar", exact: true });
  }

  async goto() {
    await this.page.goto("/whatsapp-orders");
    await expect(this.tab("Pendientes")).toBeVisible({ timeout: 15_000 });
  }

  tab(name: TrayTab) {
    return this.page.getByRole("tab", { name: new RegExp(`^${name}`) });
  }

  async openTab(name: TrayTab) {
    await this.tab(name).click();
  }

  /** Fila de la bandeja identificada por el nombre del cliente (único por prueba). */
  row(customerName: string) {
    return this.page.getByRole("row").filter({ hasText: customerName });
  }

  rowButton(customerName: string, label: string) {
    return this.row(customerName).getByRole("button", { name: label, exact: true });
  }

  /** Avanza el pedido con el botón de la fila y espera el PUT /orders/:id/status. */
  async advance(customerName: string, label: "Aprobar" | "Preparar" | "Listo" | "Entregado") {
    const response = this.page.waitForResponse(
      (r) => /\/orders\/[^/]+\/status$/.test(r.url()) && r.request().method() === "PUT",
    );
    await this.rowButton(customerName, label).click();
    expect((await response).ok(), `PUT status tras "${label}"`).toBeTruthy();
  }

  /** Botón del modal de rechazo/cancelación ("Rechazar pedido" / "Cancelar pedido"). */
  modalSubmit(verb: "Rechazar" | "Cancelar") {
    return this.page.getByRole("button", { name: `${verb} pedido`, exact: true });
  }
}
