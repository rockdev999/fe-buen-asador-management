import { describe, expect, it } from "vitest";
import type { ProductPageItem } from "../models/product.model";
import {
  getCategoryAvailability,
  getProductAvailability,
} from "./product-availability";

type Row = Pick<ProductPageItem, "available" | "locations">;

const row = (available: boolean, locs: [string, boolean][]): Row =>
  ({
    available,
    locations: locs.map(([id, a]) => ({ id, available: a })),
  }) as unknown as Row;

describe("getProductAvailability", () => {
  it("producto desactivado globalmente: switch deshabilitado con motivo", () => {
    const view = getProductAvailability(row(false, [["l1", true]]), "l1");
    expect(view.state).toBe("off");
    expect(view.disabledReason).toMatch(/globalmente/);
  });

  it("en una sucursal refleja su estado", () => {
    const r = row(true, [["l1", true], ["l2", false]]);
    expect(getProductAvailability(r, "l1").state).toBe("on");
    expect(getProductAvailability(r, "l2").state).toBe("off");
  });

  it("sucursal donde no se ofrece", () => {
    const view = getProductAvailability(row(true, [["l1", true]]), "l9");
    expect(view.disabledReason).toMatch(/No se ofrece/);
  });

  it("vista de todas las sucursales: on, off o parcial", () => {
    expect(getProductAvailability(row(true, [["a", true], ["b", true]]), null).state).toBe("on");
    expect(getProductAvailability(row(true, [["a", false], ["b", false]]), null).state).toBe("off");
    expect(getProductAvailability(row(true, [["a", true], ["b", false]]), null).state).toBe("partial");
    expect(getProductAvailability(row(true, []), null).disabledReason).toMatch(/Sin sucursales/);
  });
});

describe("getCategoryAvailability", () => {
  it("clasifica según los conteos", () => {
    expect(getCategoryAvailability({ productsCount: 0, availableProductsCount: 0 })).toBe("empty");
    expect(getCategoryAvailability({ productsCount: 3, availableProductsCount: 0 })).toBe("off");
    expect(getCategoryAvailability({ productsCount: 3, availableProductsCount: 3 })).toBe("on");
    expect(getCategoryAvailability({ productsCount: 3, availableProductsCount: 1 })).toBe("partial");
  });
});
