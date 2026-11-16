import { describe, expect, it } from "vitest";
import { OrderTypeEnum, PaymentMethodEnum, RoleEnum } from "@/constants";
import type { CartItem } from "@/features/pos/models/cart";
import type { UserDetails } from "@/features/users/models/user.model";
import {
  buildOfflineSale,
  generateOfflineTicketCode,
  getOfflineIneligibility,
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
