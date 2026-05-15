import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  Loader2,
  SearchX,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface AsyncDropdownOption<T = any> {
  id: string;
  data: T;
  render: (item: T) => React.ReactNode;
  searchText?: string; // texto para filtrar localmente
}

interface AsyncDropdownProps<T = any> {
  placeholder?: string;
  value?: string; // id seleccionado
  onChange?: (id: string, data: T | null) => void;
  options: AsyncDropdownOption<T>[];
  isLoading?: boolean;
  emptyText?: string;
  searchable?: boolean;
  className?: string;
  renderSelected?: (data: T) => React.ReactNode; // cómo mostrar el valor seleccionado
}

export function AsyncDropdown<T>({
  placeholder = "Seleccionar...",
  value,
  onChange,
  options,
  isLoading = false,
  emptyText = "Sin opciones disponibles",
  searchable = false,
  className,
  renderSelected,
}: AsyncDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.id === value);

  const filtered =
    searchable && search.trim()
      ? options.filter((o) =>
          (o.searchText ?? o.id)
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
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

  function handleSelect(opt: AsyncDropdownOption<T>) {
    onChange?.(opt.id, opt.data);
    setOpen(false);
    setSearch("");
  }

  function handleClearSelection(e: React.MouseEvent) {
    e.stopPropagation();
    onChange?.("", null);
  }

  const isActive = !!value && !!selected;

  return (
    <div ref={containerRef} className={cn("relative flex-shrink-0", className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "h-9 px-3.5 flex items-center gap-2 text-[13px] rounded-xl border transition-all duration-200 min-w-[140px]",
          isActive
            ? "border-brand/40 bg-brand/8 text-brand font-medium"
            : "border-surface bg-surface/40 text-inkblack/50 hover:border-inkblack/20 hover:bg-surface hover:text-inkblack",
        )}
      >
        <SlidersHorizontal size={12} className="flex-shrink-0 opacity-60" />

        <span className="flex-1 text-left truncate">
          {isActive
            ? renderSelected
              ? renderSelected(selected!.data)
              : selected!.render(selected!.data)
            : placeholder}
        </span>

        {isActive ? (
          <span
            onClick={handleClearSelection}
            className="text-brand/50 hover:text-brand transition-colors cursor-pointer flex-shrink-0"
          >
            ✕
          </span>
        ) : (
          <ChevronDown
            size={12}
            className={cn(
              "flex-shrink-0 opacity-50 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 min-w-[200px] w-max max-w-[280px] bg-white border border-surface rounded-2xl shadow-xl shadow-inkblack/8 overflow-hidden py-1.5">
          {/* Search interno */}
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

          {/* Todos */}
          <button
            type="button"
            onClick={() => {
              onChange?.("", null);
              setOpen(false);
              setSearch("");
            }}
            className={cn(
              "w-full flex items-center justify-between px-3.5 py-2 text-[13px] transition-colors",
              !value
                ? "text-brand font-medium bg-brand/5"
                : "text-inkblack/50 hover:bg-surface/60 hover:text-inkblack",
            )}
          >
            <span>Todos</span>
            {!value && <Check size={12} />}
          </button>

          <div className="h-px bg-surface mx-3 my-1" />

          {/* Contenido */}
          <div className="max-h-52 overflow-y-auto">
            {isLoading ? (
              // Spinner mientras carga
              <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground/50">
                <Loader2 size={15} className="animate-spin" />
                <span className="text-[12px]">Cargando...</span>
              </div>
            ) : filtered.length === 0 ? (
              // Sin resultados
              <div className="flex flex-col items-center gap-1.5 py-6">
                <SearchX size={16} className="text-muted-foreground/30" />
                <span className="text-[12px] text-muted-foreground/50">
                  {search ? "Sin coincidencias" : emptyText}
                </span>
              </div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    "w-full flex items-center justify-between px-3.5 py-2 text-[13px] transition-colors",
                    value === opt.id
                      ? "text-brand font-medium bg-brand/5"
                      : "text-inkblack/60 hover:bg-surface/60 hover:text-inkblack",
                  )}
                >
                  <span className="flex-1 text-left">
                    {opt.render(opt.data)}
                  </span>
                  {value === opt.id && (
                    <Check size={12} className="flex-shrink-0 ml-2" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
