import { useRef, useCallback } from "react";

export function usePrintTicket() {
  const ticketRef = useRef<HTMLDivElement>(null);

  const print = useCallback(() => {
    if (!ticketRef.current) return;

    // Clonar el ticket al body temporalmente
    const printRoot = document.createElement("div");
    printRoot.id = "ticket-print-root";
    printRoot.style.display = "none";
    printRoot.innerHTML = ticketRef.current.innerHTML;
    document.body.appendChild(printRoot);

    window.print();

    // Limpiar después de imprimir
    document.body.removeChild(printRoot);
  }, []);

  return { ticketRef, print };
}
