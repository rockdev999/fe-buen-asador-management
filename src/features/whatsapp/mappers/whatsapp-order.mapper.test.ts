/**
 * Pruebas de caja blanca de whatsapp-order.mapper.
 *
 * groupOrderItems — decisiones:
 *   D1: item.notes?.trim() || null   (nota vacía/ausente → null)
 *   D2: item.quantity || 1           (cantidad 0/ausente → 1)
 *   D3: lines.get(key) existe        (agrupa o crea línea nueva)
 * mapWhatsappOrderDTOToModel — D4: status === PENDING (conserva expiresAt)
 * isWhatsappOrder — D5: channel === ONLINE && createdBy === null
 */
import { describe, expect, it } from "vitest";
import { OrderEnum, OrderStatusEnum, OrderTypeEnum } from "@/constants";
import type { OrderDTO, OrderItemDTO } from "@/features/pos/dto/order.dto";
import { WhatsappPaymentPreferenceEnum, type WhatsappOrderDTO } from "../dto/whatsapp-order.dto";
import {
  groupOrderItems,
  isWhatsappOrder,
  mapWhatsappOrderDTOToModel,
  mergeOrderDTO,
} from "./whatsapp-order.mapper";

const item = (
  id: string,
  { productId = "p1", modifiers = [] as [string, string, number][], notes = "", qty = 1, price = 25 } = {},
): OrderItemDTO => ({
  id,
  product: { id: productId, name: `Producto ${productId}`, price },
  quantity: qty,
  unitPrice: price,
  notes,
  modifiers: modifiers.map(([mid, name, extra]) => ({
    id: `${id}-${mid}`,
    modifier: { id: mid, name },
    extraPrice: extra,
  })),
});

const order = (overrides: Partial<OrderDTO> = {}): OrderDTO => ({
  id: "e0131c53-aaaa-bbbb-cccc-000000000000",
  type: OrderTypeEnum.DELIVERY,
  channel: OrderEnum.ONLINE,
  status: OrderStatusEnum.PENDING,
  location: { id: "loc1", name: "Centro" },
  customerName: "Ana",
  customerPhone: "70000000",
  deliveryAddress: "Av. 1",
  items: [item("i1")],
  subtotal: 25,
  total: 25,
  audit: { createdAt: "2026-11-17T10:00:00.000Z", createdBy: null, updatedBy: null },
  ...overrides,
});

const dto = (o: OrderDTO = order()): WhatsappOrderDTO => ({
  order: o,
  whatsapp: {
    phone: "+59171234567",
    paymentPreference: WhatsappPaymentPreferenceEnum.QR,
    expiresAt: "2026-11-17T10:15:00.000Z",
  },
});

describe("groupOrderItems", () => {
  it("agrupa unidades iguales (D3 verdadero) y suma cantidad y total", () => {
    const lines = groupOrderItems([item("i1"), item("i2"), item("i3")]);

    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ name: "Producto p1", quantity: 3, total: 75, notes: null });
  });

  it("separa líneas por producto, por modificadores y por nota (D3 falso)", () => {
    const lines = groupOrderItems([
      item("i1"),
      item("i2", { productId: "p2" }),
      item("i3", { modifiers: [["m1", "Queso", 5]] }),
      item("i4", { notes: "sin sal" }),
    ]);

    expect(lines).toHaveLength(4);
  });

  it("los modificadores en distinto orden cuentan como la misma combinación", () => {
    const lines = groupOrderItems([
      item("i1", { modifiers: [["m1", "Queso", 5], ["m2", "Papas", 3]] }),
      item("i2", { modifiers: [["m2", "Papas", 3], ["m1", "Queso", 5]] }),
    ]);

    expect(lines).toHaveLength(1);
    expect(lines[0].modifiers).toEqual(["Papas", "Queso"]); // ordenados
    expect(lines[0].total).toBe(66); // (25 + 8) × 2
  });

  it("nota con solo espacios se trata como sin nota (D1 falso) y agrupa con las vacías", () => {
    const lines = groupOrderItems([item("i1", { notes: "   " }), item("i2")]);

    expect(lines).toHaveLength(1);
    expect(lines[0].notes).toBeNull();
  });

  it("nota con texto se recorta (D1 verdadero)", () => {
    expect(groupOrderItems([item("i1", { notes: "  bien cocido " })])[0].notes).toBe(
      "bien cocido",
    );
  });

  it("cantidad 0 se cuenta como 1 (D2)", () => {
    const [line] = groupOrderItems([item("i1", { qty: 0 })]);
    expect(line.quantity).toBe(1);
    expect(line.total).toBe(25);
  });

  it("redondea el total a 2 decimales al acumular", () => {
    const [line] = groupOrderItems([
      item("i1", { price: 0.1 }),
      item("i2", { price: 0.1 }),
      item("i3", { price: 0.1 }),
    ]);
    expect(line.total).toBe(0.3);
  });
});

describe("mapWhatsappOrderDTOToModel", () => {
  it("arma el modelo con código corto, teléfono sin + y vencimiento si está PENDING (D4 V)", () => {
    const model = mapWhatsappOrderDTOToModel(dto());

    expect(model).toMatchObject({
      shortId: "E0131C53",
      waPhone: "59171234567",
      paymentPreference: WhatsappPaymentPreferenceEnum.QR,
      expiresAt: "2026-11-17T10:15:00.000Z",
      locationName: "Centro",
      createdAt: "2026-11-17T10:00:00.000Z",
    });
    expect(model.lines).toHaveLength(1);
  });

  it("descarta el vencimiento fuera de PENDING (D4 F)", () => {
    const model = mapWhatsappOrderDTOToModel(dto(order({ status: OrderStatusEnum.CONFIRMED })));
    expect(model.expiresAt).toBeNull();
  });

  it("normaliza a null los datos opcionales ausentes", () => {
    const model = mapWhatsappOrderDTOToModel(
      dto(
        order({
          customerName: undefined,
          customerPhone: undefined,
          deliveryAddress: undefined,
          deliveryReference: undefined,
          audit: undefined as unknown as OrderDTO["audit"],
        }),
      ),
    );

    expect(model.customerName).toBeNull();
    expect(model.customerPhone).toBeNull();
    expect(model.deliveryAddress).toBeNull();
    expect(model.deliveryReference).toBeNull();
    expect(model.createdAt).toBeNull();
  });
});

describe("mergeOrderDTO", () => {
  it("actualiza el pedido y conserva los datos de WhatsApp previos", () => {
    const prev = mapWhatsappOrderDTOToModel(dto());
    const merged = mergeOrderDTO(prev, order({ customerName: "Ana María" }));

    expect(merged.customerName).toBe("Ana María");
    expect(merged.waPhone).toBe(prev.waPhone);
    expect(merged.paymentPreference).toBe(prev.paymentPreference);
    expect(merged.expiresAt).toBe(prev.expiresAt);
  });
});

describe("isWhatsappOrder (D5)", () => {
  it.each([
    [OrderEnum.ONLINE, null, true],
    [OrderEnum.ONLINE, { id: "u1", name: "Cajero" }, false],
    [OrderEnum.IN_STORE, null, false],
  ])("canal %s, createdBy %o → %s", (channel, createdBy, expected) => {
    expect(
      isWhatsappOrder({ channel, audit: { createdAt: null, createdBy, updatedBy: null } }),
    ).toBe(expected);
  });

  it("sin audit no es de WhatsApp", () => {
    expect(
      isWhatsappOrder({ channel: OrderEnum.ONLINE, audit: undefined as unknown as OrderDTO["audit"] }),
    ).toBe(false);
  });
});
