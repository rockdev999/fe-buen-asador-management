import { AxiosError, AxiosHeaders, CanceledError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { API_ERROR_CODES, MESSAGES } from "@/constants";
import {
  classifyError,
  isGatewayStatus,
  isIdempotent,
  parseErrorBody,
  resolveErrorMessage,
} from "./error-message";

function axiosError(code?: string, status?: number, data?: unknown) {
  const config = { headers: new AxiosHeaders() };
  const response = status
    ? ({ status, data, headers: {}, config, statusText: "" } as AxiosResponse)
    : undefined;
  return new AxiosError("x", code, config, {}, response);
}

describe("classifyError", () => {
  it("distingue cancelación, timeout, red, proxy y HTTP", () => {
    expect(classifyError(axiosError("ERR_CANCELED"))).toBe("canceled");
    expect(classifyError(axiosError("ECONNABORTED"))).toBe("timeout");
    expect(classifyError(axiosError("ETIMEDOUT"))).toBe("timeout");
    expect(classifyError(axiosError("ERR_NETWORK"))).toBe("network");
    expect(classifyError(axiosError(undefined, 502, "<html>"))).toBe(
      "unavailable",
    );
    expect(classifyError(axiosError(undefined, 504))).toBe("unavailable");
    expect(classifyError(axiosError(undefined, 500, {}))).toBe("http");
  });
});

describe("isIdempotent", () => {
  it("solo las lecturas", () => {
    expect(isIdempotent("GET")).toBe(true);
    expect(isIdempotent(undefined)).toBe(true);
    expect(isIdempotent("post")).toBe(false);
    expect(isIdempotent("delete")).toBe(false);
  });
});

describe("parseErrorBody", () => {
  it("lee el contrato del API", () => {
    expect(
      parseErrorBody({
        code: 409,
        errorCode: "SHIFT_HAS_PENDING_ORDERS",
        message: "Hay 3 pedidos",
        errors: [],
      }),
    ).toEqual({
      errorCode: "SHIFT_HAS_PENDING_ORDERS",
      message: "Hay 3 pedidos",
      errors: [],
    });
  });

  it("tolera cuerpos que no siguen el contrato", () => {
    expect(parseErrorBody("<html>Bad Gateway</html>")).toEqual({ errors: [] });
    expect(parseErrorBody(null)).toEqual({ errors: [] });
    expect(parseErrorBody({ message: "   ", errors: null })).toEqual({
      errorCode: undefined,
      message: undefined,
      errors: [],
    });
    expect(
      parseErrorBody({
        errors: [{ field: "a", message: "b" }, { foo: 1 }, null],
      }).errors,
    ).toEqual([{ field: "a", message: "b" }]);
  });
});

describe("resolveErrorMessage", () => {
  it("prioriza el message del backend", () => {
    expect(
      resolveErrorMessage({
        kind: "http",
        status: 409,
        errorCode: "SHIFT_HAS_PENDING_ORDERS",
        message: "No se puede cerrar el turno: hay 3 pedido(s) sin cobrar",
      }),
    ).toBe("No se puede cerrar el turno: hay 3 pedido(s) sin cobrar");
  });

  it("usa el texto curado del errorCode si no hay message", () => {
    expect(
      resolveErrorMessage({
        kind: "http",
        status: 409,
        errorCode: "SHIFT_NOT_OWNED",
      }),
    ).toBe("Este turno lo abrió otro cajero.");
  });

  it("cae al texto por status cuando el cuerpo no sirve", () => {
    expect(resolveErrorMessage({ kind: "http", status: 500 })).toBe(
      MESSAGES.ERROR.SERVER_ERROR,
    );
    expect(resolveErrorMessage({ kind: "http", status: 413 })).toBe(
      MESSAGES.ERROR.PAYLOAD_TOO_LARGE,
    );
    expect(resolveErrorMessage({ kind: "http", status: 418 })).toBe(
      MESSAGES.ERROR.GENERIC,
    );
  });

  it("distingue sin internet de servidor inalcanzable", () => {
    expect(resolveErrorMessage({ kind: "network", browserOnline: false })).toBe(
      MESSAGES.ERROR.OFFLINE,
    );
    expect(resolveErrorMessage({ kind: "network", browserOnline: true })).toBe(
      MESSAGES.ERROR.SERVER_UNREACHABLE,
    );
  });

  it("advierte que una escritura con timeout pudo completarse", () => {
    expect(resolveErrorMessage({ kind: "timeout", method: "get" })).toBe(
      MESSAGES.ERROR.TIMEOUT,
    );
    expect(resolveErrorMessage({ kind: "timeout", method: "post" })).toBe(
      MESSAGES.ERROR.TIMEOUT_MUTATION,
    );
  });

  it("502/503/504 ignoran el cuerpo del proxy", () => {
    expect(
      resolveErrorMessage({
        kind: "unavailable",
        status: 502,
        message: "<html>",
      }),
    ).toBe(MESSAGES.ERROR.SERVER_UNAVAILABLE);
  });
});

describe("classifyError · ramas adicionales", () => {
  it("un CanceledError de axios se clasifica como cancelado (axios.isCancel)", () => {
    expect(classifyError(new CanceledError() as unknown as AxiosError)).toBe("canceled");
  });

  it("sin código ni respuesta es error de red", () => {
    expect(classifyError(axiosError())).toBe("network");
  });

  it("503 es servicio no disponible; 4xx es HTTP normal", () => {
    expect(classifyError(axiosError(undefined, 503))).toBe("unavailable");
    expect(classifyError(axiosError(undefined, 404, {}))).toBe("http");
  });
});

describe("isGatewayStatus", () => {
  it.each([
    [502, true],
    [503, true],
    [504, true],
    [500, false],
    [undefined, false],
  ])("%s → %s", (status, expected) => {
    expect(isGatewayStatus(status)).toBe(expected);
  });
});

describe("isIdempotent · resto de métodos", () => {
  it.each([
    ["head", true],
    ["OPTIONS", true],
    ["put", false],
    ["patch", false],
  ])("%s → %s", (method, expected) => {
    expect(isIdempotent(method)).toBe(expected);
  });
});

describe("parseErrorBody · ramas adicionales", () => {
  it("message como arreglo: une solo los strings", () => {
    expect(parseErrorBody({ message: ["campo a", 3, "campo b"] }).message).toBe(
      "campo a. campo b",
    );
  });

  it("errorCode vacío o no string se descarta", () => {
    expect(parseErrorBody({ errorCode: "" }).errorCode).toBeUndefined();
    expect(parseErrorBody({ errorCode: 409 }).errorCode).toBeUndefined();
  });

  it("message de otro tipo se ignora y se recorta si es string", () => {
    expect(parseErrorBody({ message: 123 }).message).toBeUndefined();
    expect(parseErrorBody({ message: "  hola  " }).message).toBe("hola");
  });

  it("errors con field o message no string se filtran", () => {
    expect(
      parseErrorBody({
        errors: [
          { field: 1, message: "x" },
          { field: "a", message: 2 },
          "texto",
          { field: "ok", message: "bien" },
        ],
      }).errors,
    ).toEqual([{ field: "ok", message: "bien" }]);
  });
});

describe("resolveErrorMessage · ramas adicionales", () => {
  it("cancelación", () => {
    expect(resolveErrorMessage({ kind: "canceled" })).toBe(MESSAGES.ERROR.CANCELED);
  });

  it("timeout sin método se trata como lectura", () => {
    expect(resolveErrorMessage({ kind: "timeout" })).toBe(MESSAGES.ERROR.TIMEOUT);
  });

  it("network sin browserOnline asume que hay internet (valor por defecto)", () => {
    expect(resolveErrorMessage({ kind: "network" })).toBe(
      MESSAGES.ERROR.SERVER_UNREACHABLE,
    );
  });

  it("VALIDATION_ERROR sin message usa el texto de validación", () => {
    expect(
      resolveErrorMessage({
        kind: "http",
        status: 400,
        errorCode: API_ERROR_CODES.VALIDATION_ERROR,
      }),
    ).toBe(MESSAGES.ERROR.VALIDATION);
  });

  it.each([
    [API_ERROR_CODES.DUPLICATE_VALUE, 409, "Ya existe un registro con ese valor"],
    [API_ERROR_CODES.INVALID_VALUE, 400, "El valor no es válido"],
  ])("%s muestra el message del backend", (errorCode, status, message) => {
    expect(
      resolveErrorMessage({ kind: "http", status, errorCode, message }),
    ).toBe(message);
  });

  it.each([
    [API_ERROR_CODES.DUPLICATE_VALUE, 409, MESSAGES.ERROR.CONFLICT],
    [API_ERROR_CODES.INVALID_VALUE, 400, MESSAGES.ERROR.BAD_REQUEST],
  ])("%s sin message cae al texto por status", (errorCode, status, expected) => {
    expect(resolveErrorMessage({ kind: "http", status, errorCode })).toBe(
      expected,
    );
  });

  it("descuento mayor al subtotal muestra el message del backend", () => {
    expect(
      resolveErrorMessage({
        kind: "http",
        status: 400,
        errorCode: API_ERROR_CODES.BAD_REQUEST,
        message: "El descuento no puede ser mayor al subtotal",
      }),
    ).toBe("El descuento no puede ser mayor al subtotal");
  });

  it("errorCode desconocido cae al texto por status", () => {
    expect(
      resolveErrorMessage({ kind: "http", status: 404, errorCode: "ALGO_NUEVO" }),
    ).toBe(MESSAGES.ERROR.NOT_FOUND);
  });

  it("sin status ni mensaje usa el texto genérico", () => {
    expect(resolveErrorMessage({ kind: "http" })).toBe(MESSAGES.ERROR.GENERIC);
  });

  // Cobertura de cada rama del switch de statusFallback
  it.each([
    [400, MESSAGES.ERROR.BAD_REQUEST],
    [401, MESSAGES.ERROR.SESSION_EXPIRED],
    [403, MESSAGES.ERROR.UNAUTHORIZED],
    [404, MESSAGES.ERROR.NOT_FOUND],
    [409, MESSAGES.ERROR.CONFLICT],
    [413, MESSAGES.ERROR.PAYLOAD_TOO_LARGE],
    [422, MESSAGES.ERROR.UNPROCESSABLE],
    [429, MESSAGES.ERROR.TOO_MANY_REQUESTS],
    [503, MESSAGES.ERROR.SERVER_UNAVAILABLE],
    [500, MESSAGES.ERROR.SERVER_ERROR],
    [501, MESSAGES.ERROR.SERVER_ERROR],
    [418, MESSAGES.ERROR.GENERIC],
  ])("status %i sin cuerpo → texto por status", (status, expected) => {
    expect(resolveErrorMessage({ kind: "http", status })).toBe(expected);
  });
});
