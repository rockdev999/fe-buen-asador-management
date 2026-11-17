import { toast } from "sonner";
import { KNOWN_ERROR_CODES } from "@/constants";
import type { RejectedApiError } from "@/services/interceptors/error.interceptor";

/**
 * Ajuste de stock (insumos o productos) que resta más de lo que hay: el
 * backend responde 400 INSUFFICIENT_STOCK. El interceptor ya mostró el
 * mensaje; se reemplaza ese mismo toast (mismo id) agregando la sugerencia de
 * corregir el conteo con "Fijar cantidad".
 *
 * Solo para los endpoints de ajuste: al crear pedidos el mismo errorCode
 * llega como 409 con `stockWarnings` y se maneja aparte (forceCreate).
 */
export function suggestSetOnInsufficientStock(
  error: RejectedApiError,
  setLabel: string,
) {
  if (error.errorCode !== KNOWN_ERROR_CODES.INSUFFICIENT_STOCK) return;
  toast.error(error.message, {
    id: `api-error:${error.errorCode}:${error.message}`,
    description: `Si el conteo físico no coincide con el sistema, usa "${setLabel}" para registrar la cantidad real.`,
    duration: 8000,
  });
}
