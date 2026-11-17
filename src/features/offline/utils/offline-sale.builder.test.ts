import { describe, expect, it } from "vitest";
import { OrderTypeEnum, PaymentMethodEnum, RoleEnum } from "@/constants";
import type { CartItem } from "@/features/pos/models/cart";
import type { UserDetails } from "@/features/users/models/user.model";
import {
  buildOfflineSale,
  generateOfflineTicketCode,
  getOfflineIneligibility,
  mapQueuedSaleToSaleModel,
  toOfflineSaleDto,
} from "./offline-sale.builder";

const user: UserDetails = {
  id: "u1",
  name: "Cajero",
  email: "cajero@test.com",
  role: RoleEnum.CASHIER,
  locationId: "loc1",
  locationName: "Sucursal Centro",
  mustChangePassword: false,
};

const cartItem = (units: CartItem["units"], price = 20): CartItem => ({
  productId: "p1",
  name: "Pollo",
  price,
  quantity: units.length,
  notes: "",
  haveModifiers: true,
  modifiers: [],
  units,
});

const unit = (extra = 0) => ({
  unitId: crypto.randomUUID(),
  modifiers: extra ? [{ id: "m1", name: "Extra", extraPrice: extra }] : [],
  notes: "",
});

describe("generateOfflineTicketCode", () => {
  it("usa el prefijo de la sucursal sin tildes, la fecha y el marcador OFF", () => {
    const code = generateOfflineTicketCode("Árbol Norte");
    expect(code).toMatch(/^ARBO-\d{8}-OFF-[A-Z0-9]{8}$/);
  });

  it("usa POS si el nombre no tiene caracteres válidos", () => {
    expect(generateOfflineTicketCode("")).toMatch(/^POS-/);
  });
});

describe("getOfflineIneligibility", () => {
  const base = {
    cartItems: [cartItem([unit()])],
    orderType: OrderTypeEnum.TAKEAWAY,
    shiftId: "s1",
    user,
  };

  it("permite vender para llevar con turno y carrito", () => {
    expect(getOfflineIneligibility(base)).toBeNull();
  });

  it("rechaza delivery sin conexión", () => {
    expect(
      getOfflineIneligibility({ ...base, orderType: OrderTypeEnum.DELIVERY }),
    ).toMatch(/comer aquí o para llevar/);
  });

  it("rechaza si no hay turno abierto", () => {
    expect(getOfflineIneligibility({ ...base, shiftId: null })).toMatch(/turno/);
  });

  it("rechaza si no hay sucursal", () => {
    expect(
      getOfflineIneligibility({ ...base, user: { ...user, locationId: null } }),
    ).toMatch(/sucursal/);
  });

  it("rechaza carrito vacío", () => {
    expect(getOfflineIneligibility({ ...base, cartItems: [] })).toMatch(/vacío/);
  });
});

describe("buildOfflineSale", () => {
  const params = {
    cartItems: [cartItem([unit(5), unit()])],
    orderType: OrderTypeEnum.DINE_IN,
    customerName: "  Ana  ",
    paymentMethod: PaymentMethodEnum.CASH,
    receivedAmount: 50,
    discount: 5,
    shiftId: "s1",
    user,
  };

  it("crea un ítem por unidad y calcula el total con descuento", () => {
    const sale = buildOfflineSale(params);

    expect(sale.items).toHaveLength(2);
    expect(sale.items[0].modifiers).toEqual([{ modifierId: "m1", extraPrice: 5 }]);
    expect(sale.total).toBe(40); // (25 + 20) - 5
    expect(sale.totalDiscount).toBe(5);
    expect(sale.customerName).toBe("Ana");
    expect(sale.status).toBe("PENDING");
  });

  it("falla si el efectivo recibido no alcanza", () => {
    expect(() => buildOfflineSale({ ...params, receivedAmount: 10 })).toThrow(
      /no alcanza/,
    );
  });

  it("no acepta pago QR sin conexión", () => {
    expect(() =>
      buildOfflineSale({ ...params, paymentMethod: PaymentMethodEnum.QR }),
    ).toThrow();
  });
});

describe("getOfflineIneligibility · límite de unidades", () => {
  const base = { orderType: OrderTypeEnum.DINE_IN, shiftId: "s1", user };

  it("100 unidades es el máximo permitido (límite)", () => {
    const units = Array.from({ length: 100 }, () => unit());
    expect(getOfflineIneligibility({ ...base, cartItems: [cartItem(units)] })).toBeNull();
  });

  it("101 unidades se rechaza", () => {
    const units = Array.from({ length: 101 }, () => unit());
    expect(getOfflineIneligibility({ ...base, cartItems: [cartItem(units)] })).toMatch(
      /hasta 100 unidades/,
    );
  });

  it("sin usuario se rechaza por falta de sucursal", () => {
    expect(
      getOfflineIneligibility({ ...base, user: null, cartItems: [cartItem([unit()])] }),
    ).toMatch(/sucursal/);
  });
});

describe("buildOfflineSale · ramas adicionales", () => {
  const base = {
    cartItems: [cartItem([unit()])],
    orderType: OrderTypeEnum.TAKEAWAY,
    customerName: null,
    paymentMethod: PaymentMethodEnum.BANK_TRANSFER,
    receivedAmount: 0,
    discount: 0,
    shiftId: "s1",
    user,
  };

  it("transferencia: se cobra exacto aunque receivedAmount sea 0", () => {
    const sale = buildOfflineSale(base);
    expect(sale.receivedAmount).toBe(20);
    expect(sale.total).toBe(20);
  });

  it("sin descuento ni nombre no envía totalDiscount ni customerName", () => {
    const sale = buildOfflineSale(base);
    expect(sale).not.toHaveProperty("totalDiscount");
    expect(sale).not.toHaveProperty("customerName");
  });

  it("el descuento se limita al subtotal y nunca es negativo", () => {
    expect(buildOfflineSale({ ...base, discount: 999 }).total).toBe(0);
    expect(buildOfflineSale({ ...base, discount: -5 })).not.toHaveProperty("totalDiscount");
  });

  it("recorta notas y nombre del cliente y omite notas vacías", () => {
    const sale = buildOfflineSale({
      ...base,
      customerName: "x".repeat(200),
      cartItems: [
        cartItem([
          { ...unit(), notes: `  ${"n".repeat(600)}  ` },
          { ...unit(), notes: "   " },
        ]),
      ],
    });

    expect(sale.customerName).toHaveLength(150);
    expect(sale.items[0].notes).toHaveLength(500);
    expect(sale.items[1]).not.toHaveProperty("notes");
    expect(sale.items[1]).not.toHaveProperty("modifiers");
    expect(sale.display.lines[1].notes).toBe("");
  });

  it("sin nombre de sucursal usa cadenas vacías y prefijo POS", () => {
    const sale = buildOfflineSale({ ...base, user: { ...user, locationName: null } as UserDetails });
    expect(sale.display.locationName).toBe("");
    expect(sale.ticketCode).toMatch(/^POS-/);
  });

  it("efectivo recibido negativo se trata como 0 y no alcanza", () => {
    expect(() =>
      buildOfflineSale({ ...base, paymentMethod: PaymentMethodEnum.CASH, receivedAmount: -10 }),
    ).toThrow(/no alcanza/);
  });
});

describe("toOfflineSaleDto", () => {
  const sale = buildOfflineSale({
    cartItems: [
      cartItem([{ ...unit(5), notes: "sin sal" }, unit()]),
    ],
    orderType: OrderTypeEnum.DINE_IN,
    customerName: "Ana",
    paymentMethod: PaymentMethodEnum.CASH,
    receivedAmount: 50,
    discount: 5,
    shiftId: "s1",
    user,
  });

  it("deja solo los campos del contrato (sin userId, status, display…)", () => {
    const dto = toOfflineSaleDto({ ...sale, lastErrorCode: "OFFLINE_INVALID_DATA" });

    expect(Object.keys(dto).sort()).toEqual(
      [
        "customerName",
        "id",
        "items",
        "occurredAt",
        "orderType",
        "paymentMethod",
        "receivedAmount",
        "shiftId",
        "ticketCode",
        "total",
        "totalDiscount",
      ].sort(),
    );
    expect(dto.items[0]).toEqual({
      productId: "p1",
      quantity: 1,
      unitPrice: 20,
      notes: "sin sal",
      modifiers: [{ modifierId: "m1", extraPrice: 5 }],
    });
    // Ítem sin notas ni modificadores: no envía esas claves
    expect(dto.items[1]).toEqual({ productId: "p1", quantity: 1, unitPrice: 20 });
  });

  it("omite customerName y totalDiscount cuando no hay", () => {
    const dto = toOfflineSaleDto({
      ...sale,
      customerName: undefined,
      totalDiscount: undefined,
      items: [{ productId: "p1", quantity: 1, unitPrice: 20, modifiers: [] }],
    });

    expect(dto).not.toHaveProperty("customerName");
    expect(dto).not.toHaveProperty("totalDiscount");
    expect(dto.items[0]).not.toHaveProperty("modifiers");
  });
});

describe("mapQueuedSaleToSaleModel", () => {
  const params = {
    orderType: OrderTypeEnum.DINE_IN,
    customerName: null,
    discount: 5,
    shiftId: "s1",
    user,
  };

  it("agrupa las unidades por producto y calcula el cambio en efectivo", () => {
    const sale = buildOfflineSale({
      ...params,
      cartItems: [cartItem([unit(5), unit()])],
      paymentMethod: PaymentMethodEnum.CASH,
      receivedAmount: 50,
    });

    const model = mapQueuedSaleToSaleModel(sale);

    expect(model.groups).toHaveLength(1);
    expect(model.groups[0]).toMatchObject({ productId: "p1", unitCount: 2, total: 45 });
    expect(model.groups[0].units.map((u) => u.modifierLabel)).toEqual([
      "Extra",
      "Sin modificadores",
    ]);
    expect(model.subtotal).toBe(45); // total 40 + descuento 5
    expect(model.totalDiscount).toBe(5);
    expect(model.change).toBe(10); // 50 − 40
    expect(model.customerName).toBeNull();
    expect(model.isOffline).toBe(true);
  });

  it("con transferencia el cambio es 0 y sin descuento el subtotal es el total", () => {
    const sale = buildOfflineSale({
      ...params,
      discount: 0,
      customerName: "Ana",
      cartItems: [cartItem([unit()]), { ...cartItem([unit()]), productId: "p2", name: "Chorizo" }],
      paymentMethod: PaymentMethodEnum.BANK_TRANSFER,
      receivedAmount: 0,
    });

    const model = mapQueuedSaleToSaleModel(sale);

    expect(model.change).toBe(0);
    expect(model.totalDiscount).toBe(0);
    expect(model.subtotal).toBe(40);
    expect(model.groups.map((g) => g.name)).toEqual(["Pollo", "Chorizo"]);
    expect(model.customerName).toBe("Ana");
  });
});
