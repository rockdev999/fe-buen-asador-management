import { describe, expect, it } from "vitest";
import {
  formatFieldPath,
  summarizeFieldErrors,
  translateFieldMessage,
  validationToastDuration,
} from "./validation-errors";

describe("formatFieldPath", () => {
  it("traduce campos conocidos e índices de arreglos", () => {
    expect(formatFieldPath("email")).toBe("Correo");
    expect(formatFieldPath("items.0.quantity")).toBe("Ítems #1 › Cantidad");
  });

  it("deja tal cual los campos desconocidos", () => {
    expect(formatFieldPath("foo.bar")).toBe("foo › bar");
  });
});

describe("translateFieldMessage", () => {
  it("traduce los mensajes habituales de class-validator", () => {
    expect(translateFieldMessage("email must be an email")).toBe(
      "debe ser un correo válido",
    );
    expect(translateFieldMessage("quantity must not be less than 1")).toBe(
      "debe ser al menos 1",
    );
    expect(translateFieldMessage("property extra should not exist")).toBe(
      "no está permitido",
    );
  });

  it("devuelve el original si no reconoce el patrón", () => {
    expect(translateFieldMessage("algo raro")).toBe("algo raro");
  });
});

describe("summarizeFieldErrors", () => {
  it("agrupa reglas del mismo campo en una línea", () => {
    expect(
      summarizeFieldErrors([
        { field: "name", message: "name should not be empty" },
        { field: "name", message: "name must be a string" },
      ]),
    ).toEqual(["Nombre: es obligatorio, debe ser texto"]);
  });

  it("resume con 'y N más' cuando hay muchos campos", () => {
    const lines = summarizeFieldErrors(
      ["a", "b", "c", "d", "e"].map((field) => ({ field, message: "x" })),
    );
    expect(lines).toHaveLength(4);
    expect(lines[3]).toBe("y 2 campos más");
  });
});

describe("validationToastDuration", () => {
  it("crece con las líneas y tiene tope", () => {
    expect(validationToastDuration(1)).toBe(7500);
    expect(validationToastDuration(10)).toBe(12_000);
  });
});
