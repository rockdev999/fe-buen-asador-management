import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineNumberEditProps {
  value: number;
  /** Máximo de decimales permitidos (ej. 2 para productos, 3 para insumos). */
  decimals: number;
  min?: number;
  max: number;
  /** Texto corto que se muestra junto al valor y al input (ej. "KG"). */
  unitLabel?: string;
  /** Texto a mostrar cuando el valor es 0. */
  emptyLabel?: string;
  /** Si es false, solo se muestra el valor sin opción de editar. */
  editable?: boolean;
  title?: string;
  /** Debe rechazar (throw) si el guardado falla, para mantener el modo edición. */
  onSave: (value: number) => Promise<unknown>;
}

export const InlineNumberEdit = ({
  value,
  decimals,
  min = 0,
  max,
  unitLabel,
  emptyLabel,
  editable = true,
  title = "Editar",
  onSave,
}: InlineNumberEditProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.select();
  }, [isEditing]);

  const startEditing = () => {
    setDraft(String(value));
    setError(null);
    setIsEditing(true);
  };

  const cancel = () => {
    if (isSaving) return;
    setIsEditing(false);
    setError(null);
  };

  const validate = (raw: string): number | string => {
    const normalized = raw.trim().replace(",", ".");
    if (normalized === "") return "Ingresa un valor";
    if (!/^\d+(\.\d+)?$/.test(normalized)) return "Número inválido";
    const [, fraction = ""] = normalized.split(".");
    if (fraction.length > decimals) return `Máximo ${decimals} decimales`;
    const parsed = Number(normalized);
    if (parsed < min) return `Mínimo ${min}`;
    if (parsed > max) return `Máximo ${max}`;
    return parsed;
  };

  const save = async () => {
    const result = validate(draft);
    if (typeof result === "string") {
      setError(result);
      return;
    }
    if (result === value) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(result);
      setIsEditing(false);
    } catch {
      // El interceptor ya muestra el error; mantenemos el input abierto.
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void save();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  };

  if (!isEditing) {
    const isEmpty = value === 0 && !!emptyLabel;
    return (
      <div className="group flex items-center gap-1.5">
        <span
          className={cn(
            "text-[12px] tabular-nums",
            isEmpty ? "italic text-muted-foreground/60" : "text-muted-foreground",
          )}
        >
          {isEmpty ? emptyLabel : `${value}${unitLabel ? ` ${unitLabel}` : ""}`}
        </span>
        {editable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              startEditing();
            }}
            title={title}
            aria-label={title}
            className="flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground/50 opacity-60 transition-all hover:bg-surface hover:text-brand group-hover:opacity-100 focus-visible:opacity-100"
          >
            <Pencil size={11} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-1">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={draft}
            disabled={isSaving}
            onChange={(e) => {
              setDraft(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            aria-invalid={!!error}
            className={cn(
              "h-7 w-24 rounded-lg border bg-white px-2 text-[12px] tabular-nums text-inkblack",
              "focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40",
              unitLabel && "pr-10",
              error ? "border-red-400" : "border-surface",
            )}
          />
          {unitLabel && (
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground">
              {unitLabel}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => void save()}
          disabled={isSaving}
          title="Guardar"
          aria-label="Guardar"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={isSaving}
          title="Cancelar"
          aria-label="Cancelar"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface hover:text-inkblack disabled:opacity-50"
        >
          <X size={13} />
        </button>
      </div>
      {error && <span className="text-[10px] text-red-500">{error}</span>}
    </div>
  );
};
