import { cn } from "@/lib/utils";
import { Search, X, ChevronDown, Check, SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDropdown {
  key: string;
  placeholder: string;
  options: FilterOption[];
}

interface TableFiltersProps {
  searchPlaceholder?: string;
  onApply: (filters: Record<string, string>) => void;
  dropdowns?: FilterDropdown[];
  actions?: React.ReactNode;
  initialValues?: Record<string, string>;
}

export function TableFilters({
  searchPlaceholder = "Buscar...",
  onApply,
  dropdowns = [],
  actions,
  initialValues = {},
}: TableFiltersProps) {
  const [search, setSearch] = useState(initialValues.search ?? "");
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasFilters = !!search || dropdowns.some((d) => !!values[d.key]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleApply() {
    onApply({ search: search.trim(), ...values });
    setOpenDropdown(null);
  }

  function handleClear() {
    setSearch("");
    const cleared = dropdowns.reduce(
      (acc, d) => ({ ...acc, [d.key]: "" }),
      {} as Record<string, string>,
    );
    setValues(cleared);
    onApply({ search: "", ...cleared });
  }

  function setDropdownValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setOpenDropdown(null);
  }

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-2 px-4 py-2.5 border-b border-surface bg-white flex-shrink-0 flex-wrap"
    >
      {/* Search */}
      <div className="relative">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-inkblack/30 pointer-events-none"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          placeholder={searchPlaceholder}
          className="
            pl-8 pr-8 h-9 w-52 text-[13px] rounded-xl
            border border-surface bg-surface/40 text-inkblack
            placeholder:text-inkblack/30
            focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 focus:bg-white
            transition-all duration-200
          "
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-inkblack/30 hover:text-inkblack transition-colors"
          >
            <X size={11} />
          </button>
        )}
      </div>

      {/* Dropdowns */}
      {dropdowns.map((dropdown) => {
        const selectedVal = values[dropdown.key] ?? "";
        const selectedLabel =
          dropdown.options.find((o) => o.value === selectedVal)?.label ?? "";
        const isOpen = openDropdown === dropdown.key;

        return (
          <div key={dropdown.key} className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(isOpen ? null : dropdown.key)}
              className={cn(
                "h-9 px-3.5 flex items-center gap-2 text-[13px] rounded-xl border transition-all duration-200",
                selectedVal
                  ? "border-brand/40 bg-brand/8 text-brand font-medium"
                  : "border-surface bg-surface/40 text-inkblack/50 hover:border-inkblack/20 hover:bg-surface hover:text-inkblack",
              )}
            >
              <SlidersHorizontal
                size={12}
                className="flex-shrink-0 opacity-60"
              />
              <span className="whitespace-nowrap">
                {selectedVal ? selectedLabel : dropdown.placeholder}
              </span>
              <ChevronDown
                size={12}
                className={cn(
                  "flex-shrink-0 opacity-50 transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
              />
            </button>

            {isOpen && (
              <div
                className="
                absolute top-full left-0 mt-1.5 z-50 min-w-[160px]
                bg-white border border-surface rounded-2xl shadow-xl shadow-inkblack/8
                overflow-hidden py-1.5
              "
              >
                <button
                  type="button"
                  onClick={() => setDropdownValue(dropdown.key, "")}
                  className={cn(
                    "w-full flex items-center justify-between px-3.5 py-2 text-[13px] transition-colors",
                    !selectedVal
                      ? "text-brand font-medium bg-brand/5"
                      : "text-inkblack/50 hover:bg-surface/60 hover:text-inkblack",
                  )}
                >
                  <span>Todos</span>
                  {!selectedVal && <Check size={12} />}
                </button>

                <div className="h-px bg-surface mx-3 my-1" />

                {dropdown.options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDropdownValue(dropdown.key, opt.value)}
                    className={cn(
                      "w-full flex items-center justify-between px-3.5 py-2 text-[13px] transition-colors",
                      selectedVal === opt.value
                        ? "text-brand font-medium bg-brand/5"
                        : "text-inkblack/60 hover:bg-surface/60 hover:text-inkblack",
                    )}
                  >
                    <span>{opt.label}</span>
                    {selectedVal === opt.value && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Botón Buscar */}
      <button
        type="button"
        onClick={handleApply}
        className="
          h-9 px-5 text-[13px] font-medium rounded-xl
          bg-brand text-white
          hover:bg-brand-dark active:scale-[0.97]
          transition-all duration-150 flex-shrink-0
        "
      >
        Buscar
      </button>

      {/* Limpiar */}
      {hasFilters && (
        <button
          type="button"
          onClick={handleClear}
          className="
            h-9 px-3 text-[13px] text-inkblack/40 rounded-xl
            hover:text-inkblack hover:bg-surface/60
            flex items-center gap-1.5 transition-all duration-150
          "
        >
          <X size={12} />
          Limpiar
        </button>
      )}

      {/* Acciones */}
      {actions && (
        <div className="ml-auto flex items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
