import { describe, expect, it } from "vitest";
import { kardexMovedQuantity } from "./kardex";

describe("kardexMovedQuantity", () => {
  it("SET: usa la diferencia, no el valor fijado", () => {
    // SET a 3 cuando había 10: quantity sería 3, pero se movieron 7.
    expect(
      kardexMovedQuantity({ previousQuantity: 10, subsequentQuantity: 3 }),
    ).toBe(7);
    expect(
      kardexMovedQuantity({ previousQuantity: 2, subsequentQuantity: 5 }),
    ).toBe(3);
  });

  it("SET al mismo valor no mueve nada", () => {
    expect(
      kardexMovedQuantity({ previousQuantity: 4, subsequentQuantity: 4 }),
    ).toBe(0);
  });

  it("funciona con stock negativo y sin errores de coma flotante", () => {
    expect(
      kardexMovedQuantity({ previousQuantity: -2, subsequentQuantity: 1 }),
    ).toBe(3);
    expect(
      kardexMovedQuantity({ previousQuantity: 0.1, subsequentQuantity: 0.4 }),
    ).toBe(0.3);
  });
});
