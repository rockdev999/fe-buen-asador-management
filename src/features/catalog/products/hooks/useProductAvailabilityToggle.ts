import { useState } from "react";
import { useUpdateProductAvailability } from "./useProducts";
import { ProductPageItem } from "../models/product.model";

interface Options {
  /**
   * locationId a enviar en el PATCH: el del filtro del MANAGER, o undefined
   * (ADMIN/CASHIER, el backend usa su sucursal; MANAGER en "todas").
   */
  requestLocationId?: string | null;
  /** Con el filtro de disponibilidad activo, la fila debe salir del listado. */
  isAvailabilityFiltered: boolean;
  refetch: () => unknown;
}

/** Cambia la disponibilidad de un producto evitando peticiones simultáneas. */
export function useProductAvailabilityToggle({
  requestLocationId,
  isAvailabilityFiltered,
  refetch,
}: Options) {
  const { mutateAsync } = useUpdateProductAvailability();
  // Evita que un doble clic mande dos cambios contradictorios del mismo producto.
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());

  async function toggle(row: ProductPageItem, available: boolean) {
    if (pendingIds.has(row.id)) return;
    setPendingIds((prev) => new Set(prev).add(row.id));
    try {
      await mutateAsync({ id: row.id, available, locationId: requestLocationId });
      if (isAvailabilityFiltered) await refetch();
    } catch {
      // El interceptor ya mostró el error; el switch sigue reflejando el
      // valor del servidor.
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(row.id);
        return next;
      });
    }
  }

  return { toggle, pendingIds };
}
