/**
 * Preparación de datos del catálogo por API (como el gerente), para que las
 * pruebas de interfaz verifiquen cómo se muestran y se usan.
 */
import type { APIRequestContext } from "@playwright/test";
import { API_URL } from "./api";
import { users } from "./users";

const unwrap = async (res: Awaited<ReturnType<APIRequestContext["get"]>>) => {
  if (!res.ok()) throw new Error(`${res.url()} → ${res.status()} ${await res.text()}`);
  const body = await res.json();
  return body && "data" in body ? body.data : body;
};

export async function managerToken(request: APIRequestContext): Promise<string> {
  const login = await unwrap(
    await request.post(`${API_URL}/auth/login`, {
      data: { identifier: users.manager.identifier, password: users.manager.password },
    }),
  );
  const session = await unwrap(
    await request.post(`${API_URL}/auth/select-location`, {
      headers: { Authorization: `Bearer ${login.temporaryToken}` },
      data: { locationId: null },
    }),
  );
  return session.accessToken;
}

export async function locationIdByName(
  request: APIRequestContext,
  token: string,
  name: string,
): Promise<string> {
  const list: { id: string; name: string }[] = await unwrap(
    await request.get(`${API_URL}/locations/simple`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  );
  const found = list.find((l) => l.name === name);
  if (!found) throw new Error(`No existe la sucursal "${name}"`);
  return found.id;
}

export async function createCategory(
  request: APIRequestContext,
  token: string,
  name: string,
  locationIds: string[],
): Promise<{ id: string }> {
  return unwrap(
    await request.post(`${API_URL}/categories`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name, locationIds },
    }),
  );
}

export async function createProduct(
  request: APIRequestContext,
  token: string,
  dto: {
    name: string;
    price: number;
    categoryId: string;
    locationIds: string[];
    locationPrices?: { locationId: string; price: number | null }[];
  },
): Promise<{ id: string }> {
  return unwrap(
    await request.post(`${API_URL}/products`, {
      headers: { Authorization: `Bearer ${token}` },
      multipart: { dto: JSON.stringify({ isQuantifiable: false, haveModifiers: false, ...dto }) },
    }),
  );
}

export async function setProductAvailability(
  request: APIRequestContext,
  token: string,
  productId: string,
  available: boolean,
  locationId?: string,
): Promise<void> {
  await unwrap(
    await request.patch(
      `${API_URL}/products/${productId}/availability${locationId ? `?locationId=${locationId}` : ""}`,
      { headers: { Authorization: `Bearer ${token}` }, data: { available } },
    ),
  );
}

/** Nombre único por prueba (todas comparten la base). */
export const uniqueName = (prefix: string) =>
  `${prefix} ${Date.now().toString(36).slice(-5)}${Math.floor(Math.random() * 100)}`;
