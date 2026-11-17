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

describe("formatFieldPath · ramas adicionales", () => {
  it("un índice al inicio no tiene a qué pegarse y se muestra tal cual", () => {
    expect(formatFieldPath("0.name")).toBe("0 › Nombre");
  });

  it("índices anidados", () => {
    expect(formatFieldPath("items.1.modifiers.0")).toBe("Ítems #2 › Modificadores #1");
  });
});

describe("translateFieldMessage · cada patrón", () => {
  it.each([
    ["name should not be empty", "es obligatorio"],
    ["name must not be empty", "es obligatorio"],
    ["id must be a UUID", "no es un identificador válido"],
    ["amount must not be less than -5", "debe ser al menos -5"],
    ["quantity must not be greater than 99.5", "no puede ser mayor a 99.5"],
    ["price must be a positive number", "debe ser mayor a 0"],
    ["password must be longer than or equal to 8 characters", "debe tener al menos 8 caracteres"],
    ["name must be shorter than or equal to 150 characters", "debe tener como máximo 150 caracteres"],
    ["quantity must be an integer number", "debe ser un número entero"],
    ["price must be a number conforming to the specified constraints", "debe ser un número"],
    ["name must be a string", "debe ser texto"],
    ["available must be a boolean value", "debe ser verdadero o falso"],
    ["items must be an array", "debe ser una lista"],
    ["items must contain at least 1 elements", "debe tener al menos 1 elemento(s)"],
    ["items must contain at least 1 element", "debe tener al menos 1 elemento(s)"],
    ["date must be a valid ISO 8601 date string", "debe ser una fecha válida"],
    ["startDate must be a Date instance", "debe ser una fecha válida"],
    ["role must be one of the following values: ADMIN, CASHIER", "tiene un valor no permitido"],
  ])("%s → %s", (input, expected) => {
    expect(translateFieldMessage(input)).toBe(expected);
  });

  it("no distingue mayúsculas", () => {
    expect(translateFieldMessage("EMAIL MUST BE AN EMAIL")).toBe("debe ser un correo válido");
  });
});

describe("summarizeFieldErrors · ramas adicionales", () => {
  it("no repite el mismo mensaje traducido dos veces en un campo", () => {
    expect(
      summarizeFieldErrors([
        { field: "name", message: "name should not be empty" },
        { field: "name", message: "name must not be empty" },
      ]),
    ).toEqual(["Nombre: es obligatorio"]);
  });

  it("exactamente 3 campos no se resumen (límite)", () => {
    const lines = summarizeFieldErrors(
      ["a", "b", "c"].map((field) => ({ field, message: "x" })),
    );
    expect(lines).toEqual(["a: x", "b: x", "c: x"]);
  });

  it("4 campos → 'y 1 campo más' en singular", () => {
    const lines = summarizeFieldErrors(
      ["a", "b", "c", "d"].map((field) => ({ field, message: "x" })),
    );
    expect(lines[3]).toBe("y 1 campo más");
  });

  it("lista vacía → sin líneas", () => {
    expect(summarizeFieldErrors([])).toEqual([]);
  });
});

describe("validationToastDuration · límites", () => {
  it("0 líneas = base de 6 s; 4 líneas = justo el tope", () => {
    expect(validationToastDuration(0)).toBe(6000);
    expect(validationToastDuration(4)).toBe(12_000);
  });
});
