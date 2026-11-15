import { MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Nombre accesible, p. ej. "Disponible: Hamburguesa". */
  ariaLabel: string;
  disabled?: boolean;
  /** Texto de ayuda nativo (tooltip). */
  title?: string;
  className?: string;
}

/** Interruptor compacto (role="switch") para usar en tablas y filas. */
export function Switch({
  checked,
  onChange,
  ariaLabel,
  disabled,
  title,
  className,
}: SwitchProps) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    // Suele vivir dentro de filas clicables: no abrir el modal de la fila.
    e.stopPropagation();
    if (!disabled) onChange(!checked);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      title={title}
      onClick={handleClick}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-1",
        checked ? "bg-brand" : "bg-muted-foreground/25",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
