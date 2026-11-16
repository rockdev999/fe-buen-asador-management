import { describe, expect, it } from "vitest";
import { calculateTotal, formatMoneyInput, parseMoney } from "./money";

describe("parseMoney", () => {
  it("convierte texto con separadores a número", () => {
    expect(parseMoney("1,234.567")).toBe(1234.57);
  });

  it("devuelve 0 si no hay valor", () => {
    expect(parseMoney("")).toBe(0);
  });
});

describe("formatMoneyInput", () => {
  it("deja un solo punto y máximo 2 decimales", () => {
    expect(formatMoneyInput("12.345")).toBe("12.34");
    expect(formatMoneyInput("1.2.3")).toBe("1.23");
  });
});

describe("calculateTotal", () => {
  it("suma precio + modificadores por cantidad sin errores de coma flotante", () => {
    const total = calculateTotal([
      { price: 0.1, quantity: 3 },
      { price: 25, quantity: 2, modifiersTotal: 2.5 },
    ]);
    expect(total).toBe(55.3);
  });
});
