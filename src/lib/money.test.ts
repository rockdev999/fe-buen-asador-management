import { describe, expect, it } from "vitest";
import {
  calculateTotal,
  formatMoney,
  formatMoneyDisplay,
  formatMoneyInput,
  parseMoney,
} from "./money";

describe("parseMoney", () => {
  it("convierte texto con separadores a número", () => {
    expect(parseMoney("1,234.567")).toBe(1234.57);
  });

  it("devuelve 0 si no hay valor", () => {
    expect(parseMoney("")).toBe(0);
  });

  it("devuelve 0 si el texto no tiene números (NaN)", () => {
    expect(parseMoney("abc")).toBe(0);
  });

  it("ignora símbolos de moneda sin punto", () => {
    expect(parseMoney("BOB 25.50")).toBe(25.5);
  });

  it("limitación conocida: el punto de 'Bs.' se confunde con el decimal", () => {
    // "Bs. 25.50" → ".25.50" → parseFloat = 0.25. Hoy parseMoney no se usa en
    // producción; si se empieza a usar con el prefijo, hay que corregirlo.
    expect(parseMoney("Bs. 25.50")).toBe(0.25);
  });
});

describe("formatMoneyInput", () => {
  it("deja un solo punto y máximo 2 decimales", () => {
    expect(formatMoneyInput("12.345")).toBe("12.34");
    expect(formatMoneyInput("1.2.3")).toBe("1.23");
  });

  it("sin punto o con hasta 2 decimales lo deja igual (quitando lo que no es número)", () => {
    expect(formatMoneyInput("12a3")).toBe("123");
    expect(formatMoneyInput("12.3")).toBe("12.3");
    expect(formatMoneyInput("12.")).toBe("12.");
  });
});

describe("formatMoney / formatMoneyDisplay", () => {
  it("formatMoney incluye la moneda y 2 decimales", () => {
    const out = formatMoney(1234.5);
    expect(out).toMatch(/BOB/);
    expect(out).toMatch(/1,234\.50/);
  });

  it("formatMoneyDisplay muestra solo el número con 2 decimales", () => {
    expect(formatMoneyDisplay(1234.5)).toBe("1,234.50");
    expect(formatMoneyDisplay(0.005)).toBe("0.01");
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

  it("lista vacía → 0", () => {
    expect(calculateTotal([])).toBe(0);
  });
});
