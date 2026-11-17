/**
 * Acceso directo a la API del backend para preparar datos de prueba
 * (obtener IDs de sucursal, categoría y producto) sin pasar por la interfaz.
 */
import type { APIRequestContext } from "@playwright/test";
import type { TestUser } from "./users";

export const API_URL = process.env.VITE_API_URL ?? "http://localhost:3000/api";

export interface CashierSession {
  token: string;
  locationId: string;
}

/** Login en dos pasos por API (credenciales → sucursal). */
export async function loginByApi(
  request: APIRequestContext,
  user: TestUser,
): Promise<CashierSession> {
  const login = await request.post(`${API_URL}/auth/login`, {
    data: { identifier: user.identifier, password: user.password },
  });
  if (!login.ok()) throw new Error(`Login por API falló: ${login.status()}`);
  const body = await login.json();

  const location = (body.locations as { id: string; name: string }[]).find(
    (l) => l.name === user.location,
  );
  if (!location) throw new Error(`El usuario no tiene la sucursal "${user.location}"`);

  const session = await request.post(`${API_URL}/auth/select-location`, {
    headers: { Authorization: `Bearer ${body.temporaryToken}` },
    data: { locationId: location.id },
  });
  if (!session.ok()) throw new Error(`Selección de sucursal falló: ${session.status()}`);

  return { token: (await session.json()).accessToken, locationId: location.id };
}

/** Busca un producto del menú de la sucursal por nombre exacto. */
export async function findMenuProduct(
  request: APIRequestContext,
  session: CashierSession,
  productName: string,
): Promise<{ productId: string; categoryId: string }> {
  const res = await request.get(`${API_URL}/products/menu`, {
    headers: { Authorization: `Bearer ${session.token}` },
  });
  if (!res.ok()) throw new Error(`GET /products/menu falló: ${res.status()}`);

  const categories = (await res.json()).data as {
    id: string;
    products: { id: string; name: string }[];
  }[];
  for (const category of categories) {
    const product = category.products.find((p) => p.name === productName);
    if (product) return { productId: product.id, categoryId: category.id };
  }
  throw new Error(`El producto "${productName}" no está en el menú de la sucursal`);
}
