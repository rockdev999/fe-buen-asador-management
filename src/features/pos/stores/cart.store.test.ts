import { beforeEach, describe, expect, it } from "vitest";
import type { CategoryProduct } from "@/features/catalog/categories/models/category.model";
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
