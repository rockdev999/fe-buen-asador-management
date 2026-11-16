import { useRef, useCallback } from "react";

/**
 * Imprime un ticket (venta o cierre de caja) en formato de 80 mm.
 *
 * Clona el ticket en un nodo temporal del body; los estilos de impresión de
 * ticket.css ocultan el resto de la página y limitan ese nodo a 80 mm.
 */
export function usePrintTicket() {
  const ticketRef = useRef<HTMLDivElement>(null);

  const print = useCallback(() => {
    if (!ticketRef.current) return;

    const printRoot = document.createElement("div");
    printRoot.id = "ticket-print-root";
    printRoot.style.display = "none";
    // outerHTML (no innerHTML): conserva el contenedor .ticket-print, que es
    // el que fija el ancho de 80 mm. Sin él, el ticket ocupaba toda la hoja.
    printRoot.innerHTML = ticketRef.current.outerHTML;
    document.body.appendChild(printRoot);

    window.print();

    document.body.removeChild(printRoot);
  }, []);

  return { ticketRef, print };
}
