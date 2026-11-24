/**
 * Cantidad que realmente se movió en un registro del kardex.
 *
 * No se usa `quantity`: en un ajuste SET el backend guarda ahí el valor final
 * que se fijó, no la diferencia. La resta cubre todos los casos (ajustes,
 * ventas, anulaciones) para productos e insumos. Se redondea a 3 decimales
 * para no mostrar errores de coma flotante (p. ej. 0.30000000000000004).
 */
export function kardexMovedQuantity(movement: {
  previousQuantity: number;
  subsequentQuantity: number;
}): number {
  const diff = Math.abs(
    movement.subsequentQuantity - movement.previousQuantity,
  );
  return Math.round(diff * 1000) / 1000;
}
