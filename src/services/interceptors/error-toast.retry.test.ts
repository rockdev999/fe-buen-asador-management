/**
 * Integración: interceptor de errores real + política de reintento de React
 * Query. Cuenta cuántos toasts VE el usuario (sonner reemplaza un toast si
 * llega otro con el mismo id mientras sigue visible).
 */
import axios, { AxiosError, AxiosHeaders, type AxiosAdapter } from "axios";
import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const shown: { id?: string | number; message: string }[] = [];
function record(message: unknown, opts?: { id?: string | number }) {
  // Mismo id → sonner actualiza el toast existente, no crea otro.
  if (opts?.id !== undefined && shown.some((t) => t.id === opts.id)) return;
  shown.push({ id: opts?.id, message: String(message) });
}

vi.mock("sonner", () => ({
  toast: { error: vi.fn(record), warning: vi.fn(record), success: vi.fn() },
}));
vi.mock("@/services/auth/session.service", () => ({
  logoutSession: vi.fn(),
  refreshSession: vi.fn(),
  requireLocationSelection: vi.fn(),
  requirePasswordChange: vi.fn(),
  SessionEndedError: class extends Error {},
}));
vi.mock("@/stores/auth.store", () => ({
  useAuthStore: { getState: () => ({ refreshToken: null }) },
}));
vi.mock("@/features/offline/stores/offline.store", () => {
  let offline = false;
  return {
    markOffline: () => (offline = true),
    markOnline: () => (offline = false),
    useOfflineStore: { getState: () => ({ isOffline: offline }) },
  };
});

const { errorInterceptor } = await import("./error.interceptor");
const { shouldRetryQuery } = await import("@/lib/query-client");
const { useOfflineStore, markOnline } =
  await import("@/features/offline/stores/offline.store");

/** Cliente cuyo adapter falla siempre igual, contando las peticiones. */
function failingClient(fail: (config: Parameters<AxiosAdapter>[0]) => never) {
  const calls = { count: 0 };
  const client = axios.create({
    adapter: async (config) => {
      calls.count++;
      fail(config);
    },
  });
  client.interceptors.response.use(undefined, (e) =>
    errorInterceptor(e, client),
  );
  return { client, calls };
}

function httpFailure(status: number, data: unknown) {
  return (config: Parameters<AxiosAdapter>[0]): never => {
    throw new AxiosError(
      "fail",
      undefined,
      config,
      {},
      {
        status,
        data,
        statusText: "",
        headers: {},
        config: { ...config, headers: new AxiosHeaders() },
      },
    );
  };
}

async function runQuery(client: ReturnType<typeof axios.create>) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: shouldRetryQuery, retryDelay: 0 } },
  });
  await qc
    .fetchQuery({ queryKey: ["x"], queryFn: () => client.get("/x") })
    .catch(() => undefined);
}

beforeEach(() => {
  shown.length = 0;
  markOnline();
  vi.stubGlobal("window", { location: { pathname: "/dashboard" } });
  vi.stubGlobal("navigator", { onLine: true });
});
afterEach(() => vi.unstubAllGlobals());

describe("un error de consulta muestra un solo toast", () => {
  it("404: no se reintenta", async () => {
    const { client, calls } = failingClient(
      httpFailure(404, {
        errorCode: "NOT_FOUND",
        message: "Producto no encontrado",
        errors: [],
      }),
    );
    await runQuery(client);
    expect(calls.count).toBe(1);
    expect(shown).toEqual([
      expect.objectContaining({ message: "Producto no encontrado" }),
    ]);
  });

  it("400 de validación: no se reintenta", async () => {
    const { client, calls } = failingClient(
      httpFailure(400, {
        errorCode: "VALIDATION_ERROR",
        message: "Error de validación",
        errors: [{ field: "email", message: "email must be an email" }],
      }),
    );
    await runQuery(client);
    expect(calls.count).toBe(1);
    expect(shown).toHaveLength(1);
  });

  it("500: se reintenta una vez, pero el usuario ve un solo toast", async () => {
    const { client, calls } = failingClient(
      httpFailure(500, {
        errorCode: "INTERNAL_SERVER_ERROR",
        message: "Error interno del servidor",
        errors: [],
      }),
    );
    await runQuery(client);
    expect(calls.count).toBe(2);
    expect(shown).toHaveLength(1);
  });

  it("502 del proxy: no se reintenta y pasa a offline", async () => {
    const { client, calls } = failingClient(
      httpFailure(502, "<html>Bad Gateway</html>"),
    );
    await runQuery(client);
    expect(calls.count).toBe(1);
    expect(shown).toHaveLength(1);
    expect(useOfflineStore.getState().isOffline).toBe(true);
  });

  it("timeout: no se reintenta", async () => {
    const { client, calls } = failingClient((config) => {
      throw new AxiosError("timeout", "ECONNABORTED", config);
    });
    await runQuery(client);
    expect(calls.count).toBe(1);
    expect(shown).toHaveLength(1);
  });

  it("sin red: un solo aviso aunque fallen varias consultas", async () => {
    const { client } = failingClient((config) => {
      throw new AxiosError("Network Error", "ERR_NETWORK", config);
    });
    await Promise.all([runQuery(client), runQuery(client), runQuery(client)]);
    expect(shown).toHaveLength(1);
  });

  it("cancelada: sin toast", async () => {
    const { client } = failingClient((config) => {
      throw new axios.CanceledError(undefined, config);
    });
    await runQuery(client);
    expect(shown).toHaveLength(0);
  });
});
