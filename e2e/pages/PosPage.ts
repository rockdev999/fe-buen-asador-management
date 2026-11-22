/** Page Object del Punto de Venta: carrito → revisión → cobro → éxito. */
import { expect, type Locator, type Page } from "@playwright/test";

export type OrderType = "Presencial" | "Delivery" | "Para llevar";
export type PaymentMethod = "Efectivo" | "Tarjeta" | "QR";

export class PosPage {
  readonly shiftOpenBadge: Locator;
  readonly checkoutButton: Locator;
  readonly subtotal: Locator;
  readonly emptyCart: Locator;

  // Modal "Revisar pedido"
  readonly reviewHeading: Locator;
  readonly customerName: Locator;
  readonly customerPhone: Locator;
  readonly customerAddress: Locator;
  readonly confirmOrder: Locator;
  readonly incompleteFields: Locator;

  // Modal "Registrar cobro"
  readonly paymentHeading: Locator;
  readonly receivedAmount: Locator;
  readonly confirmPayment: Locator;

  // Modal de éxito
  readonly successHeading: Locator;
  readonly newOrderButton: Locator;

  constructor(readonly page: Page) {
    this.shiftOpenBadge = page.getByRole("button", { name: "Turno abierto" });
    this.checkoutButton = page.getByRole("button", { name: "Cobrar pedido" });
    this.subtotal = page.getByText(/^Subtotal/).first();
    this.emptyCart = page.getByText("Agrega productos al pedido");

    this.reviewHeading = page.getByRole("heading", { name: "Revisar pedido" });
    this.customerName = page.getByPlaceholder("Ej: Juan Pérez");
    this.customerPhone = page.getByPlaceholder("Ej: 777-123-45");
    this.customerAddress = page.getByPlaceholder("Ej: Av. Siempre Viva #123");
    this.confirmOrder = page.getByRole("button", { name: "Confirmar →" });
    this.incompleteFields = page.getByText("Completa todos los campos");

    this.paymentHeading = page.getByRole("heading", { name: "Registrar cobro" });
    // Hay otro "0.00" (descuento): se toma el campo de la fila "Recibido".
    this.receivedAmount = page
      .locator("div")
      .filter({ has: page.getByText("Recibido", { exact: true }) })
      .last()
      .getByPlaceholder("0.00");
    this.confirmPayment = page.getByRole("button", { name: "Confirmar cobro" });

    this.successHeading = page.getByRole("heading", { name: "¡Pago registrado!" });
    this.newOrderButton = page.getByRole("button", { name: "Nuevo pedido" });
  }

  async goto() {
    await this.page.goto("/pos");
    await expect(this.checkoutButton).toBeVisible({ timeout: 15_000 });
  }

  /** Precondición de las ventas: el cajero tiene un turno abierto. */
  async expectShiftOpen() {
    await expect(
      this.shiftOpenBadge,
      "Precondición: el cajero debe tener un turno abierto en la sucursal de prueba",
    ).toBeVisible();
  }

  /**
   * Tarjeta de producto del menú. Su nombre accesible es
   * "<texto de la imagen o iniciales> <nombre> BOB <precio>": sin imagen, la
   * tarjeta muestra las iniciales en lugar del nombre repetido.
   */
  product(name: string) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return this.page
      .getByRole("button", { name: new RegExp(`^\\S+.* ${escaped} BOB `) })
      .first();
  }

  /** Pestaña de categoría del menú (el POS muestra una categoría a la vez). */
  category(name: string) {
    return this.page.getByRole("button", { name, exact: true });
  }

  async openCategory(name: string) {
    await this.category(name).click();
  }

  async addProduct(name: string, times = 1) {
    for (let i = 0; i < times; i++) await this.product(name).click();
  }

  async selectOrderType(type: OrderType) {
    await this.page.getByRole("button", { name: type, exact: true }).click();
  }

  async openReview() {
    await this.checkoutButton.click();
    await expect(this.reviewHeading).toBeVisible();
  }

  async confirmAndGoToPayment() {
    await this.confirmOrder.click();
    await expect(this.paymentHeading).toBeVisible({ timeout: 15_000 });
  }

  async selectPaymentMethod(method: PaymentMethod) {
    await this.page.getByRole("button", { name: method, exact: true }).click();
  }

  /** Texto del recuadro Cambio / Vuelto / Falta del modal de cobro. */
  changeBox(label: "Cambio" | "Vuelto" | "Falta") {
    return this.page.getByText(label, { exact: true });
  }
}
