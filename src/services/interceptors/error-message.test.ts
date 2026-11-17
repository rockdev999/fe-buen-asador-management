import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { MESSAGES } from "@/constants";
import {
  classifyError,
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
