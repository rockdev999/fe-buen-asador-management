// src/components/shared/Interactives/MultiSelectDropdown.tsx
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Check,
  SlidersHorizontal,
  X,
  SearchX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface MultiSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface MultiSelectDropdownProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  emptyText?: string;
  className?: string;
  label?: string;
  error?: string;
  touched?: boolean;
  maxDisplay?: number;
}

export function MultiSelectDropdown({
  options,
  value = [],
  onChange,
  placeholder = "Seleccionar...",
  searchable = false,
  emptyText = "Sin opciones",
  className,
  label,
  error,
  touched,
  maxDisplay = 2,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered =
    searchable && search.trim()
      ? options.filter(
          (o) =>
            o.label.toLowerCase().includes(search.trim().toLowerCase()) ||
            o.description?.toLowerCase().includes(search.trim().toLowerCase()),
        )
      : options;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchable) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open, searchable]);

  function toggle(val: string) {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  }

  function toggleAll() {
    if (value.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map((o) => o.value));
    }
  }

  function removeOne(val: string, e: React.MouseEvent) {
    e.stopPropagation();
    onChange(value.filter((v) => v !== val));
  }

  const selectedOptions = options.filter((o) => value.includes(o.value));
  const visibleSelected = selectedOptions.slice(0, maxDisplay);
  const remaining = selectedOptions.length - maxDisplay;
  const allSelected = value.length === options.length && options.length > 0;
  const hasValue = value.length > 0;

  // Texto del trigger
  const triggerContent = hasValue ? (
    <div className="flex items-center gap-1 flex-wrap flex-1 min-w-0">
      {visibleSelected.map((opt) => (
        <span
          key={opt.value}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand/15 text-brand text-[11px] font-medium"
        >
          {opt.label}
          <button
            type="button"
            onClick={(e) => removeOne(opt.value, e)}
            className="hover:text-brand-dark transition-colors"
          >
            <X size={9} />
          </button>
        </span>
      ))}
      {remaining > 0 && (
        <span className="text-[11px] text-brand font-medium">+{remaining}</span>
      )}
    </div>
  ) : (
    <span className="text-inkblack/40 text-[13px]">{placeholder}</span>
  );

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {label && (
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
          {label}
        </p>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "w-full min-h-9 px-3 py-1.5 flex items-center gap-2 rounded-xl border transition-all duration-200 text-left",
          hasValue
            ? "border-brand/40 bg-brand/5"
            : "border-surface bg-surface/40 hover:border-inkblack/20 hover:bg-surface",
          touched && error && "border-red-300",
          open && "border-brand/40 ring-2 ring-brand/10",
        )}
      >
        <SlidersHorizontal
          size={12}
          className={cn(
            "flex-shrink-0 opacity-60",
            hasValue ? "text-brand" : "text-inkblack/40",
          )}
        />
        <div className="flex-1 min-w-0">{triggerContent}</div>
        <ChevronDown
          size={12}
          className={cn(
            "flex-shrink-0 opacity-40 transition-transform duration-200",
            open && "rotate-180",
            hasValue && "text-brand",
          )}
        />
      </button>

      {touched && error && (
        <p className="text-[12px] text-red-500 mt-0.5">{error}</p>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-surface rounded-2xl shadow-xl shadow-inkblack/8 overflow-hidden py-1.5">
          {/* Search */}
          {searchable && (
            <div className="px-2 pb-1.5 pt-0.5 border-b border-surface">
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full h-7 px-2.5 text-[12px] rounded-lg border border-surface bg-surface/40 text-inkblack placeholder:text-muted-foreground/40 focus:outline-none focus:border-brand/40 transition-colors"
              />
            </div>
          )}

          {/* Seleccionar todos */}
          {options.length > 0 && !search && (
            <>
              <button
                type="button"
                onClick={toggleAll}
                className={cn(
                  "w-full flex items-center gap-3 px-3.5 py-2 text-[13px] transition-colors",
                  allSelected
                    ? "text-brand font-medium bg-brand/5"
                    : "text-inkblack/50 hover:bg-surface/60 hover:text-inkblack",
                )}
              >
                {/* Checkbox */}
                <span
                  className={cn(
                    "w-4 h-4 rounded border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all",
                    allSelected
                      ? "bg-brand border-brand"
                      : value.length > 0
                        ? "bg-brand/20 border-brand/40"
                        : "border-surface bg-white",
                  )}
                >
                  {allSelected && (
                    <Check size={10} className="text-white" strokeWidth={3} />
                  )}
                  {!allSelected && value.length > 0 && (
                    <span className="w-2 h-0.5 bg-brand rounded" />
                  )}
                </span>
                <span>Todos ({options.length})</span>
              </button>
              <div className="h-px bg-surface mx-3 my-1" />
            </>
          )}

          {/* Opciones */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 py-6">
                <SearchX size={16} className="text-muted-foreground/30" />
                <span className="text-[12px] text-muted-foreground/50">
                  {search ? "Sin coincidencias" : emptyText}
                </span>
              </div>
            ) : (
              filtered.map((opt) => {
                const isSelected = value.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggle(opt.value)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3.5 py-2 text-[13px] transition-colors",
                      isSelected
                        ? "text-brand font-medium bg-brand/5"
                        : "text-inkblack/60 hover:bg-surface/60 hover:text-inkblack",
                    )}
                  >
                    {/* Checkbox */}
                    <span
                      className={cn(
                        "w-4 h-4 rounded border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all",
                        isSelected
                          ? "bg-brand border-brand"
                          : "border-surface bg-white",
                      )}
                    >
                      {isSelected && (
                        <Check
                          size={10}
                          className="text-white"
                          strokeWidth={3}
                        />
                      )}
                    </span>

                    {/* Label + description */}
                    <div className="flex flex-col items-start min-w-0">
                      <span>{opt.label}</span>
                      {opt.description && (
                        <span className="text-[10px] text-muted-foreground/50 font-normal">
                          {opt.description}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer — limpiar */}
          {hasValue && (
            <>
              <div className="h-px bg-surface mx-3 my-1" />
              <button
                type="button"
                onClick={() => {
                  onChange([]);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-[11px] text-muted-foreground/50 hover:text-red-500 transition-colors"
              >
                <X size={10} />
                Limpiar selección
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
