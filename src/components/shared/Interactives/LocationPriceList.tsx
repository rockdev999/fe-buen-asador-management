import { useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { cn, formatMoney } from "@/lib/utils";
import { MoneyInput } from "./MoneyInput";

export interface LocationPriceValue {
  locationId: string;
  price: number | null;
}

interface LocationPriceListProps {
  locations: { id: string; name: string }[];
  selectedIds: string[];
  prices: LocationPriceValue[];
  basePrice: number;
  allowZero?: boolean;
  onChange: (selectedIds: string[], prices: LocationPriceValue[]) => void;
  getPriceError?: (locationId: string) => string | undefined;
  error?: string;
}

export function LocationPriceList({
  locations,
  selectedIds,
  prices,
  basePrice,
  allowZero = false,
  onChange,
  getPriceError,
  error,
}: LocationPriceListProps) {
  const selected = new Set(selectedIds);
  const allSelected =
    locations.length > 0 && locations.every((loc) => selected.has(loc.id));

  const [revisions, setRevisions] = useState<Record<string, number>>({});
  const lastTyped = useRef<Record<string, number>>({});
  const remount = (locationId: string) =>
    setRevisions((r) => ({ ...r, [locationId]: (r[locationId] ?? 0) + 1 }));

  const normalize = (value: number): number | null => {
    if (!allowZero && value <= 0) return null; // vacío en productos = general
    if (value === (basePrice || 0)) return null;
    return value;
  };

  const emit = (ids: Set<string>, override?: LocationPriceValue) => {
    const nextIds = locations.filter((l) => ids.has(l.id)).map((l) => l.id);
    const nextPrices = nextIds.map((locationId) => {
      if (override?.locationId === locationId) return override;
      return (
        prices.find((p) => p.locationId === locationId) ?? {
          locationId,
          price: null,
        }
      );
    });
    onChange(nextIds, nextPrices);
  };

  const toggleLocation = (locationId: string, checked: boolean) => {
    const ids = new Set(selected);
    if (checked) ids.add(locationId);
    else ids.delete(locationId);
    emit(ids);
  };

  const toggleAll = () =>
    emit(allSelected ? new Set() : new Set(locations.map((l) => l.id)));

  const setPrice = (locationId: string, price: number | null) =>
    emit(selected, { locationId, price });

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          {selectedIds.length} de {locations.length} sucursales
        </span>
        {locations.length > 1 && (
          <button
            type="button"
            onClick={toggleAll}
            className="text-[11px] font-medium text-brand hover:underline"
          >
            {allSelected ? "Quitar todas" : "Seleccionar todas"}
          </button>
        )}
      </div>

      <ul
        className={cn(
          "divide-y divide-surface rounded-2xl border bg-white",
          error ? "border-destructive" : "border-surface",
        )}
      >
        {locations.map((location) => {
          const isSelected = selected.has(location.id);
          const price =
            prices.find((p) => p.locationId === location.id)?.price ?? null;
          const priceError =
            isSelected && price !== null
              ? getPriceError?.(location.id)
              : undefined;

          return (
            <li
              key={location.id}
              className="flex items-center justify-between gap-3 px-3 py-2"
            >
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) =>
                    toggleLocation(location.id, e.target.checked)
                  }
                  className="h-4 w-4 shrink-0 cursor-pointer accent-brand"
                />
                <span
                  className={cn(
                    "truncate text-[13px]",
                    isSelected ? "text-inkblack" : "text-muted-foreground",
                  )}
                >
                  {location.name}
                </span>
              </label>

              {!isSelected ? (
                <span className="shrink-0 text-[11px] text-muted-foreground/70 h-8 flex items-center">
                  No se ofrece
                </span>
              ) : (
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <div className="flex items-center gap-2">
                    {price !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setPrice(location.id, null);
                          remount(location.id);
                        }}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-surface hover:text-inkblack"
                        aria-label={`Usar precio general en ${location.name}`}
                        title="Volver al precio general"
                      >
                        <RotateCcw size={12} />
                      </button>
                    )}
                    <PriceTag
                      price={price}
                      basePrice={basePrice}
                      allowZero={allowZero}
                    />
                    <div className="w-32">
                      <MoneyInput
                        key={`${location.id}-${revisions[location.id] ?? 0}`}
                        id={`locationPrice-${location.id}`}
                        aria-label={`Precio en ${location.name}`}
                        defaultValue={price ?? (basePrice || 0)}
                        onChange={(value) => {
                          lastTyped.current[location.id] = value;
                          setPrice(location.id, normalize(value));
                        }}
                        onBlur={() => {
                          // Quedó en el general (vacío o mismo monto): mostrarlo.
                          const typed = lastTyped.current[location.id];
                          if (
                            typed !== undefined &&
                            normalize(typed) === null
                          ) {
                            remount(location.id);
                          }
                        }}
                        placeholder="0.00"
                        className="h-8 rounded-lg bg-white text-[13px]"
                      />
                    </div>
                  </div>
                  {priceError && (
                    <p className="text-right text-[10px] leading-tight text-destructive">
                      {priceError}
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {error && (
        <p className="text-[10px] leading-tight text-destructive">{error}</p>
      )}
    </div>
  );
}

/** Etiqueta junto al monto: general, gratis o diferencia con el general. */
function PriceTag({
  price,
  basePrice,
  allowZero,
}: {
  price: number | null;
  basePrice: number;
  allowZero: boolean;
}) {
  if (price === null) {
    return <span className="text-[10px] text-muted-foreground">General</span>;
  }
  if (allowZero && price === 0) {
    return (
      <span className="text-[11px] font-medium text-green-600">Gratis</span>
    );
  }
  const diff = Math.round((price - (basePrice || 0)) * 100) / 100;
  return (
    <span
      className={cn(
        "whitespace-nowrap text-[11px] font-medium tabular-nums",
        diff > 0 ? "text-amber-600" : "text-blue-600",
      )}
    >
      {diff > 0 ? "+" : "−"}
      {formatMoney(Math.abs(diff))}
    </span>
  );
}
