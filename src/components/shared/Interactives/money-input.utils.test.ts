import { describe, expect, it } from "vitest";
import {
  formatForDisplay,
  parseMoneyString,
  sanitizeInput,
} from "./money-input.utils";

describe("parseMoneyString", () => {
  it("devuelve 0 para cadenas vacías o inválidas", () => {
    expect(parseMoneyString("")).toBe(0);
    expect(parseMoneyString("   ")).toBe(0);
    expect(parseMoneyString("abc")).toBe(0);
  });

  it("ignora los separadores de miles", () => {
    expect(parseMoneyString("1,500.50")).toBe(1500.5);
  });

  it("redondea a 2 decimales", () => {
    expect(parseMoneyString("10.456")).toBe(10.46);
  });
});

describe("formatForDisplay", () => {
  it("muestra 0 como cadena vacía", () => {
    expect(formatForDisplay(0)).toBe("");
  });

  it("formatea con miles y 2 decimales", () => {
    expect(formatForDisplay(1500.5)).toBe("1,500.50");
  });
});

describe("sanitizeInput", () => {
  it("acepta coma como separador decimal", () => {
    expect(sanitizeInput("15,50")).toBe("15.50");
  });

  it("elimina letras y deja un solo punto", () => {
    expect(sanitizeInput("1a2.3.4")).toBe("12.34");
  });

  it("limita a 2 decimales", () => {
    expect(sanitizeInput("9.999")).toBe("9.99");
  });

  it("limita a 10 dígitos enteros", () => {
    expect(sanitizeInput("123456789012")).toBe("1234567890");
  });

  it("no permite superar el máximo", () => {
    expect(sanitizeInput("600", 500)).toBe("500.00");
    expect(sanitizeInput("400", 500)).toBe("400");
  });
});
