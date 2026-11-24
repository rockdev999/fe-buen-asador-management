import { describe, expect, it } from "vitest";
import {
  IngredientUnitEnum,
  StockMesurementUnitTypeEnum,
} from "@/constants";
import {
  getStockWarnings,
  StockWarning,
  stockWarningUnitLabel,
} from "./stock-warning";

const warnings = [
  {
    productId: "p1",
    productName: "Pollo entero",
    type: "PRODUCT_STOCK",
    currentStock: 0,
    unit: "UNIT",
  },
  {
    productId: "p2",
    productName: "Pique",
    type: "INGREDIENT_STOCK",
    ingredientId: "i1",
    ingredientName: "Papa",
    currentStock: -2,
    unit: "KG",
  },
];

describe("getStockWarnings", () => {
  it("lee data.stockWarnings del 409 INSUFFICIENT_STOCK", () => {
    expect(
      getStockWarnings({
        errorCode: "INSUFFICIENT_STOCK",
        data: { stockWarnings: warnings },
      }),
    ).toEqual(warnings);
  });

  it("devuelve null si es otro error o no trae la lista", () => {
    expect(
      getStockWarnings({
        errorCode: "NOT_FOUND",
        data: { stockWarnings: warnings },
      }),
    ).toBeNull();
    expect(getStockWarnings({ errorCode: "INSUFFICIENT_STOCK" })).toBeNull();
    expect(
      getStockWarnings({
        errorCode: "INSUFFICIENT_STOCK",
        data: { stockWarnings: [] },
      }),
    ).toBeNull();
    expect(getStockWarnings(null)).toBeNull();
  });

  it("devuelve null si stockWarnings no es un arreglo o data no lo trae", () => {
    expect(
      getStockWarnings({
        errorCode: "INSUFFICIENT_STOCK",
        data: { stockWarnings: "sin stock" },
      }),
    ).toBeNull();
    expect(
      getStockWarnings({ errorCode: "INSUFFICIENT_STOCK", data: {} }),
    ).toBeNull();
    expect(getStockWarnings(undefined)).toBeNull();
  });
});

describe("stockWarningUnitLabel", () => {
  const product = (unit: string): StockWarning =>
    ({
      type: "PRODUCT_STOCK",
      productId: "p1",
      productName: "Pollo entero",
      currentStock: 0,
      unit,
    }) as StockWarning;
  const ingredient = (unit: string): StockWarning =>
    ({
      type: "INGREDIENT_STOCK",
      productId: "p2",
      productName: "Pique",
      ingredientId: "i1",
      ingredientName: "Papa",
      currentStock: -2,
      unit,
    }) as StockWarning;

  it("usa la etiqueta de unidades de producto para PRODUCT_STOCK", () => {
    expect(
      stockWarningUnitLabel(product(StockMesurementUnitTypeEnum.KILOGRAM)),
    ).toBe("Kilogramo");
  });

  it("usa la etiqueta de unidades de insumo para INGREDIENT_STOCK", () => {
    expect(stockWarningUnitLabel(ingredient(IngredientUnitEnum.ARROBA))).toBe(
      "Arroba",
    );
  });

  it("muestra el código de la unidad si no tiene etiqueta", () => {
    expect(stockWarningUnitLabel(product("CAJA"))).toBe("CAJA");
    expect(stockWarningUnitLabel(ingredient("BOLSA"))).toBe("BOLSA");
  });
});
