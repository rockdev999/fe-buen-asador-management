/**
 * Pruebas de caja blanca de order.mapper.
 *
 * mapCartToCreateOrderDTO — grafo de flujo:
 *   D1: orderType === DELIVERY
 *   D2: !customerName || !customerPhone || !customerAddress  (3 condiciones)
 *   D3: orderType === TAKEAWAY
 *   D4: !customerName
 *   D5: unit.notes || item.notes  (en el aplanado de unidades)
 *   D6: customerName || null      (rama DINE_IN)
 *
 * Complejidad ciclomática V(G) = decisiones simples + 1 = (1 + 3 + 1 + 1 + 1 + 1) + 1 = 9.
 * Caminos independientes cubiertos abajo (C1..C9).
 */
import { describe, expect, it } from "vitest";
import { OrderEnum, OrderStatusEnum, OrderTypeEnum } from "@/constants";
import type { CartItem } from "../models/cart";
import type {
  ManagerOrderPageItemDTO,
  OrderDTO,
  OrderItemDTO,
} from "../dto/order.dto";
import {
  mapCartToCreateOrderDTO,
  mapManagerOrderPageItemDTOToModel,
  mapOrderDTOToModel,
  mapOrderDTOToSnapshot,
  mapOrderItemDTOToModel,
  mapOrderPageItemDTOToModel,
  mapOrderSaleItemDTOToModel,
} from "./order.mapper";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const cart: CartItem[] = [
  {
    productId: "p1",
    name: "Pollo",
    price: 25,
    quantity: 2,
    notes: "nota del ítem",
    haveModifiers: true,
    modifiers: [],
    units: [
      { unitId: "u1", modifiers: [{ id: "m1", name: "Queso", extraPrice: 5 }], notes: "sin sal" },
      { unitId: "u2", modifiers: [], notes: "" },
    ],
  },
];

const map = (
  type: OrderTypeEnum,
  name: string | null,
  phone: string | null = null,
  address: string | null = null,
) =>
  mapCartToCreateOrderDTO(
    cart,
    type,
    OrderEnum.IN_STORE,
    name,
    phone,
    address,
    "portón verde",
    OrderStatusEnum.CONFIRMED,
  );

const itemDTO = (overrides: Partial<OrderItemDTO> = {}): OrderItemDTO => ({
  id: "i1",
  product: { id: "p1", name: "Pollo", price: 25 },
  quantity: 2,
  unitPrice: 25,
  notes: "",
  modifiers: [],
  ...overrides,
});

const orderDTO = (overrides: Partial<OrderDTO> = {}): OrderDTO => ({
  id: "o1",
  type: OrderTypeEnum.DINE_IN,
  channel: OrderEnum.IN_STORE,
  status: OrderStatusEnum.PENDING,
  location: { id: "loc1", name: "Centro" },
  items: [itemDTO()],
  subtotal: 50,
  total: 50,
  audit: { createdAt: null, createdBy: { id: "u1", name: "Ana" }, updatedBy: null },
  ...overrides,
});

// ─── mapCartToCreateOrderDTO ──────────────────────────────────────────────────

describe("mapCartToCreateOrderDTO", () => {
  it("C1 · aplana cada unidad en un ítem de cantidad 1 con sus modificadores (D5 verdadero y falso)", () => {
    const dto = map(OrderTypeEnum.DINE_IN, null);

    expect(dto.items).toEqual([
      { productId: "p1", quantity: 1, notes: "sin sal", modifiers: [{ modifierId: "m1" }] },
      // unit.notes vacío → usa la nota del ítem
      { productId: "p1", quantity: 1, notes: "nota del ítem", modifiers: [] },
    ]);
  });

  it("C2 · DELIVERY con todos los datos devuelve el DTO completo (D1 V, D2 F)", () => {
    const dto = map(OrderTypeEnum.DELIVERY, "Ana", "70000000", "Av. Siempre Viva");

    expect(dto).toMatchObject({
      type: OrderTypeEnum.DELIVERY,
      channel: OrderEnum.IN_STORE,
      initialStatus: OrderStatusEnum.CONFIRMED,
      customerName: "Ana",
      customerPhone: "70000000",
      customerAddress: "Av. Siempre Viva",
      deliveryReference: "portón verde",
    });
  });

  // Cobertura de condiciones de D2: cada sub-condición hace verdadera la decisión por sí sola.
  it.each([
    ["C3 · sin nombre", null, "70000000", "Av. 1"],
    ["C4 · sin teléfono", "Ana", null, "Av. 1"],
    ["C5 · sin dirección", "Ana", "70000000", null],
  ])("%s → DELIVERY lanza error (D2 V)", (_, name, phone, address) => {
    expect(() => map(OrderTypeEnum.DELIVERY, name, phone, address)).toThrow(
      /delivery.*nombre, teléfono y dirección/,
    );
  });

  it("C6 · TAKEAWAY con nombre no envía teléfono ni dirección (D3 V, D4 F)", () => {
    const dto = map(OrderTypeEnum.TAKEAWAY, "Luis", "70000000", "Av. 1");

    expect(dto.customerName).toBe("Luis");
    expect(dto).not.toHaveProperty("customerPhone");
    expect(dto).not.toHaveProperty("customerAddress");
    expect(dto).not.toHaveProperty("deliveryReference");
  });

  it("C7 · TAKEAWAY sin nombre lanza error (D4 V)", () => {
    expect(() => map(OrderTypeEnum.TAKEAWAY, "")).toThrow(/para llevar/);
  });

  it("C8 · DINE_IN con nombre lo conserva (D6 V)", () => {
    expect(map(OrderTypeEnum.DINE_IN, "Mesa 4").customerName).toBe("Mesa 4");
  });

  it("C9 · DINE_IN sin nombre envía null (D6 F)", () => {
    const dto = map(OrderTypeEnum.DINE_IN, "");

    expect(dto.customerName).toBeNull();
    expect(dto.type).toBe(OrderTypeEnum.DINE_IN);
  });
});

// ─── DTO → modelos ────────────────────────────────────────────────────────────

describe("mapOrderItemDTOToModel", () => {
  it("calcula el subtotal como (precio + Σ extras) × cantidad", () => {
    const item = mapOrderItemDTOToModel(
      itemDTO({
        quantity: 3,
        modifiers: [
          { id: "x1", modifier: { id: "m1", name: "Queso" }, extraPrice: 5 },
          { id: "x2", modifier: { id: "m2", name: "Papas" }, extraPrice: 2.5 },
        ],
      }),
    );

    expect(item.subtotal).toBe(97.5); // (25 + 7.5) × 3
    expect(item.modifiers.map((m) => m.name)).toEqual(["Queso", "Papas"]);
  });
});

describe("mapOrderDTOToModel", () => {
  it("suma los subtotales de los ítems redondeando a 2 decimales", () => {
    const order = mapOrderDTOToModel(
      orderDTO({
        items: [
          itemDTO({ id: "a", unitPrice: 0.1, quantity: 1 }),
          itemDTO({ id: "b", unitPrice: 0.2, quantity: 1 }),
        ],
      }),
    );

    expect(order.total).toBe(0.3); // sin error de coma flotante (0.30000000000000004)
    expect(order.locationName).toBe("Centro");
  });

  it("convierte los datos opcionales del cliente ausentes en null", () => {
    const order = mapOrderDTOToModel(orderDTO());

    expect(order.customerName).toBeNull();
    expect(order.customerPhone).toBeNull();
    expect(order.customerAddress).toBeNull();
    expect(order.deliveryReference).toBeNull();
  });
});

describe("mapOrderDTOToSnapshot", () => {
  it("ítem sin modificadores → una unidad vacía", () => {
    const snap = mapOrderDTOToSnapshot(orderDTO());

    expect(snap.items[0].haveModifiers).toBe(false);
    expect(snap.items[0].units).toEqual([{ unitId: "i1", modifiers: [], notes: "" }]);
    expect(snap.isWhatsapp).toBe(false);
    expect(snap.cancellationReason).toBeNull();
  });

  it("ítem con modificadores → una unidad con los modificadores y su precio numérico", () => {
    const snap = mapOrderDTOToSnapshot(
      orderDTO({
        items: [
          itemDTO({
            notes: "bien cocido",
            modifiers: [
              { id: "x1", modifier: { id: "m1", name: "Queso" }, extraPrice: "5" as unknown as number },
            ],
          }),
        ],
      }),
    );

    expect(snap.items[0].haveModifiers).toBe(true);
    expect(snap.items[0].units[0]).toEqual({
      unitId: "i1",
      modifiers: [{ id: "m1", name: "Queso", extraPrice: 5 }],
      notes: "bien cocido",
    });
  });

  it("marca como WhatsApp un pedido ONLINE creado por el bot (createdBy null)", () => {
    const snap = mapOrderDTOToSnapshot(
      orderDTO({
        channel: OrderEnum.ONLINE,
        audit: { createdAt: null, createdBy: null, updatedBy: null },
      }),
    );

    expect(snap.isWhatsapp).toBe(true);
  });
});

describe("mappers de listados", () => {
  it("mapOrderPageItemDTOToModel normaliza cancellationReason ausente a null", () => {
    const item = mapOrderPageItemDTOToModel({
      id: "o1",
      customerName: null,
      channel: OrderEnum.IN_STORE,
      type: OrderTypeEnum.DINE_IN,
      status: OrderStatusEnum.PAID,
      subtotal: 10,
      updatedAt: null,
    });

    expect(item.cancellationReason).toBeNull();
  });

  it("mapManagerOrderPageItemDTOToModel agrega la sucursal", () => {
    const dto: ManagerOrderPageItemDTO = {
      id: "o1",
      customerName: "Ana",
      channel: OrderEnum.ONLINE,
      type: OrderTypeEnum.DELIVERY,
      status: OrderStatusEnum.CANCELLED,
      subtotal: 10,
      updatedAt: null,
      cancellationReason: "No fue confirmado a tiempo",
      location: { id: "loc1", name: "Centro" },
    };

    expect(mapManagerOrderPageItemDTOToModel(dto)).toMatchObject({
      locationId: "loc1",
      locationName: "Centro",
      cancellationReason: "No fue confirmado a tiempo",
    });
  });

  it("mapOrderSaleItemDTOToModel conserva el subtotal recibido y mapea los modificadores", () => {
    const item = mapOrderSaleItemDTOToModel(
      itemDTO({ modifiers: [{ id: "x1", modifier: { id: "m1", name: "Queso" }, extraPrice: 5 }] }),
      60,
    );

    expect(item.itemSubtotal).toBe(60);
    expect(item.modifiers[0]).toEqual({
      id: "x1",
      modifier: { id: "m1", name: "Queso" },
      extraPrice: 5,
    });
  });
});
