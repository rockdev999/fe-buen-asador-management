import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  /** Texto de ayuda. */
  children: React.ReactNode;
  /** Nombre accesible del botón (p. ej. "Qué incluye el reporte de ventas"). */
  label?: string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  iconSize?: number;
}

// Solo un tooltip abierto en toda la app: al abrir uno se cierra el anterior.
let closeActive: (() => void) | null = null;

/**
 * Icono (i) con un tooltip de ayuda. Se muestra solo mientras el cursor está
 * sobre el icono, con el foco del teclado (Tab) o al tocarlo en pantallas
 * táctiles. Usa Popover de Radix (ya instalado) en vez de añadir
 * @radix-ui/react-tooltip.
 */
export function InfoTooltip({
  children,
  label = "Más información",
  side = "top",
  className,
  iconSize = 13,
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef(() => setOpen(false));

  function show() {
    if (closeActive && closeActive !== closeRef.current) closeActive();
    closeActive = closeRef.current;
    setOpen(true);
  }

  function hide() {
    if (closeActive === closeRef.current) closeActive = null;
    setOpen(false);
  }

  // Si se desmonta abierto (p. ej. se cierra el menú que lo contiene).
  useEffect(() => {
    const close = closeRef.current;
    return () => {
      if (closeActive === close) closeActive = null;
    };
  }, []);

  return (
    <Popover open={open} onOpenChange={(o) => (o ? show() : hide())}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onMouseEnter={show}
          onMouseLeave={hide}
          // Solo el foco por teclado lo abre: tras un clic con el mouse el
          // icono queda enfocado y el tooltip no debe quedarse abierto.
          onFocus={(e) => {
            if (e.currentTarget.matches(":focus-visible")) show();
          }}
          onBlur={hide}
          // Tocar abre (en táctil no hay hover) sin activar lo que lo contiene.
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            show();
          }}
          className={cn(
            "relative z-10 inline-flex shrink-0 items-center justify-center rounded-full text-inkblack/35 transition-colors hover:text-brand focus-visible:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
            className,
          )}
        >
          <Info size={iconSize} />
        </button>
      </PopoverTrigger>
      {/* Se desmonta al cerrar (sin animación de salida): desaparece al
          instante y nunca se ven dos mientras uno se desvanece. Radix pisa el
          `animation` inline, por eso se quita del árbol en vez de anularla. */}
      {open && (
        <PopoverContent
          side={side}
          sideOffset={6}
          collisionPadding={12}
          role="tooltip"
          // Sin robar el foco: es ayuda, no un diálogo.
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          // No captura el cursor: el tooltip vive solo mientras el cursor
          // está sobre el icono.
          className="pointer-events-none z-[60] w-auto max-w-[260px] rounded-lg border-0 bg-inkblack px-3 py-2 text-[11px] leading-snug text-white shadow-lg"
        >
          {children}
        </PopoverContent>
      )}
    </Popover>
  );
}
