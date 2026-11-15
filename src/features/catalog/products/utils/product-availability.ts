import { ProductPageItem } from "../models/product.model";

export type AvailabilityState = "on" | "off" | "partial";

export interface ProductAvailabilityView {
  state: AvailabilityState;
  /** Si está definido, el switch va deshabilitado y se muestra este texto. */
  disabledReason?: string;
}

/**
 * Estado del switch de disponibilidad de un producto según el alcance.
 *
 * @param scopeLocationId sucursal de la pantalla (ADMIN/CASHIER: la suya;
 *   MANAGER: la del filtro) o null si el MANAGER ve "todas".
 */
export function getProductAvailability(
  row: Pick<ProductPageItem, "available" | "locations">,
  scopeLocationId: string | null,
): ProductAvailabilityView {
  // El interruptor global solo se cambia desde el formulario del producto.
  if (!row.available) {
    return {
      state: "off",
      disabledReason: "Desactivado globalmente (editar producto)",
    };
  }

  if (scopeLocationId) {
    const location = row.locations.find((l) => l.id === scopeLocationId);
    if (!location) {
      return { state: "off", disabledReason: "No se ofrece en esta sucursal" };
    }
    return { state: location.available ? "on" : "off" };
  }

  if (row.locations.length === 0) {
    return { state: "off", disabledReason: "Sin sucursales asignadas" };
  }
  const availableCount = row.locations.filter((l) => l.available).length;
  if (availableCount === row.locations.length) return { state: "on" };
  if (availableCount === 0) return { state: "off" };
  return { state: "partial" };
}

export type CategoryAvailabilityState = AvailabilityState | "empty";

/**
 * Estado del switch de una categoría a partir de sus conteos (ya vienen
 * calculados por el backend para el alcance con que se pidió el listado).
 */
export function getCategoryAvailability(category: {
  productsCount: number;
  availableProductsCount: number;
}): CategoryAvailabilityState {
  if (category.productsCount === 0) return "empty";
  if (category.availableProductsCount === 0) return "off";
  if (category.availableProductsCount >= category.productsCount) return "on";
  return "partial";
}
