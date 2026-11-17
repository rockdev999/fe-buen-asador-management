import { beforeEach, describe, expect, it } from "vitest";
import type { CategoryProduct } from "@/features/catalog/categories/models/category.model";
import { OrderEnum, OrderTypeEnum } from "@/constants";
import { useCartStore } from "./cart.store";

const product = (id: string, price: number) =>
  ({ id, name: `Producto ${id}`, price, haveModifiers: true }) as unknown as CategoryProduct;

const store = () => useCartStore.getState();

describe("useCartStore", () => {
  beforeEach(() => {
    store().clearCart();
  });

  it("agrega un producto nuevo con una unidad", () => {
    store().addItem(product("p1", 20));

    expect(store().items).toHaveLength(1);
    expect(store().items[0].quantity).toBe(1);
    expect(store().items[0].units).toHaveLength(1);
  });

  it("al agregar el mismo producto suma una unidad independiente", () => {
    store().addItem(product("p1", 20));
    store().addItem(product("p1", 20));

    const [item] = store().items;
    expect(store().items).toHaveLength(1);
    expect(item.quantity).toBe(2);
    expect(item.units[0].unitId).not.toBe(item.units[1].unitId);
  });

  it("updateQty agrega o quita unidades y con 0 elimina el producto", () => {
    store().addItem(product("p1", 20));

    store().updateQty("p1", 3);
    expect(store().items[0].units).toHaveLength(3);

    store().updateQty("p1", 1);
    expect(store().items[0].units).toHaveLength(1);

    store().updateQty("p1", 0);
    expect(store().items).toHaveLength(0);
  });

  it("calcula el subtotal con modificadores distintos por unidad", () => {
    store().addItem(product("p1", 25));
    store().addItem(product("p1", 25));
    const [item] = store().items;

    store().updateItem("p1", [
      { ...item.units[0], modifiers: [{ id: "m1", name: "Queso", extraPrice: 5 }] },
      { ...item.units[1], modifiers: [] },
    ]);

    expect(store().getSubtotal()).toBe(55);
    expect(store().getItemCount()).toBe(2);
  });

  it("aplica el descuento al total", () => {
    store().addItem(product("p1", 30.5));
    store().updateDiscount(10.25);

    expect(store().getTotal()).toBe(20.25);
  });

  it("clearCart vacía el carrito, los datos del cliente y el descuento", () => {
    store().addItem(product("p1", 10));
    store().setCustomer("Juan");
    store().updateDiscount(2);

    store().clearCart();

    expect(store().items).toHaveLength(0);
    expect(store().customerName).toBeNull();
    expect(store().discount).toBe(0);
  });
});

describe("useCartStore · ramas adicionales", () => {
  beforeEach(() => {
    store().clearCart();
    store().setOrderType(OrderTypeEnum.DINE_IN, OrderEnum.IN_STORE);
  });

  it("precio no numérico se guarda como 0 (Number(price) || 0)", () => {
    store().addItem(product("p1", "abc" as unknown as number));
    expect(store().items[0].price).toBe(0);
    expect(store().getSubtotal()).toBe(0);
  });

  it("addItem de otro producto no modifica los existentes", () => {
    store().addItem(product("p1", 10));
    store().addItem(product("p2", 15));
    store().addItem(product("p2", 15));

    expect(store().items.map((i) => [i.productId, i.quantity])).toEqual([
      ["p1", 1],
      ["p2", 2],
    ]);
  });

  it("updateQty con la misma cantidad conserva las unidades (ni agrega ni quita)", () => {
    store().addItem(product("p1", 10));
    store().addItem(product("p1", 10));
    const before = store().items[0].units.map((u) => u.unitId);

    store().updateQty("p1", 2);

    expect(store().items[0].units.map((u) => u.unitId)).toEqual(before);
  });

  it("updateQty con cantidad negativa elimina el producto", () => {
    store().addItem(product("p1", 10));
    store().updateQty("p1", -1);
    expect(store().items).toHaveLength(0);
  });

  it("updateQty solo afecta al producto indicado", () => {
    store().addItem(product("p1", 10));
    store().addItem(product("p2", 10));
    store().updateQty("p2", 3);

    expect(store().items[0].quantity).toBe(1);
    expect(store().items[1].quantity).toBe(3);
  });

  it("removeItem y reorderItems", () => {
    store().addItem(product("p1", 10));
    store().addItem(product("p2", 20));

    store().reorderItems([...store().items].reverse());
    expect(store().items.map((i) => i.productId)).toEqual(["p2", "p1"]);

    store().removeItem("p2");
    expect(store().items.map((i) => i.productId)).toEqual(["p1"]);
  });

  it("guarda tipo de pedido, canal y datos del cliente; clearCart los limpia salvo el tipo", () => {
    store().setOrderType(OrderTypeEnum.DELIVERY, OrderEnum.ONLINE);
    store().setCustomer("Ana");
    store().setCustomerPhone("70000000");
    store().setCustomerAddress("Av. 1");
    store().setDeliveryReference("portón verde");

    expect(store()).toMatchObject({
      orderType: OrderTypeEnum.DELIVERY,
      orderChannel: OrderEnum.ONLINE,
      customerName: "Ana",
      customerPhone: "70000000",
      customerAddress: "Av. 1",
      deliveryReference: "portón verde",
    });

    store().clearCart();
    expect(store().customerPhone).toBeNull();
    expect(store().customerAddress).toBeNull();
    expect(store().deliveryReference).toBeNull();
    expect(store().orderType).toBe(OrderTypeEnum.DELIVERY);
  });

  it("ítem sin unidades usa el cálculo de respaldo precio × cantidad", () => {
    store().reorderItems([
      {
        productId: "p1",
        name: "Legacy",
        price: 12.5,
        quantity: 2,
        notes: "",
        haveModifiers: false,
        modifiers: [],
        units: [],
      },
    ]);

    expect(store().getSubtotal()).toBe(25);
  });

  it("descuento no numérico se ignora en el total", () => {
    store().addItem(product("p1", 10));
    store().updateDiscount("x" as unknown as number);
    expect(store().getTotal()).toBe(10);
  });
});
