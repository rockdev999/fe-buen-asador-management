import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModifiers } from "../../hooks/useModifiers";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/utils";
import type { CartItem, CartItemUnit } from "../../models/cart";
import type { Modifier } from "../../models/modifier";

interface CartItemEditModalProps {
  item: CartItem;
  onSave: (productId: string, units: CartItemUnit[]) => void;
  onClose: () => void;
}

export function CartItemEditModal({
  item,
  onSave,
  onClose,
}: CartItemEditModalProps) {
  const { data: modifiers, status } = useModifiers();

  const [units, setUnits] = useState<CartItemUnit[]>(
    item.units.length > 0
      ? item.units
      : Array.from({ length: item.quantity }, () => ({
          unitId: crypto.randomUUID(),
          modifiers: [],
          notes: "",
        })),
  );

  function getUnitPrice(unit: CartItemUnit): number {
    const extra = unit.modifiers.reduce((s, m) => s + m.extraPrice, 0);
    return item.price + extra;
  }

  const total = units.reduce((s, u) => s + getUnitPrice(u), 0);

  function toggleModifier(unitId: string, mod: Modifier) {
    setUnits((prev) =>
      prev.map((u) => {
        if (u.unitId !== unitId) return u;
        const has = u.modifiers.find((m) => m.id === mod.id);
        return {
          ...u,
          modifiers: has
            ? u.modifiers.filter((m) => m.id !== mod.id)
            : [...u.modifiers, mod],
        };
      }),
    );
  }

  function updateNote(unitId: string, notes: string) {
    setUnits((prev) =>
      prev.map((u) => (u.unitId === unitId ? { ...u, notes } : u)),
    );
  }

  function addUnit() {
    setUnits((prev) => [
      ...prev,
      { unitId: crypto.randomUUID(), modifiers: [], notes: "" },
    ]);
  }

  function removeUnit(unitId: string) {
    if (units.length <= 1) return;
    setUnits((prev) => prev.filter((u) => u.unitId !== unitId));
  }

  function handleSave() {
    onSave(item.productId, units);
    onClose();
  }

  return (
    <div className="absolute inset-0 bg-inkblack/55 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[380px] overflow-hidden flex flex-col max-h-[90%]">
        {/* Header */}
        <div className="flex items-start justify-between px-4 py-3.5 border-b border-surface flex-shrink-0">
          <div>
            <p className="text-md font-medium text-inkblack">{item.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cada unidad puede tener modificadores distintos
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-md font-medium text-brand">
              {formatMoney(item.price)}/u
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-inkblack"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Units list */}
        <div className="flex-1 overflow-y-auto px-4 py-1 flex flex-col gap-3">
          {status === "pending" && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Cargando modificadores...
            </p>
          )}
          {units.map((unit, idx) => (
            <div
              key={unit.unitId}
              className="border-[1.5px] border-surface rounded-xl"
            >
              {/* Unit header */}
              <div className="flex items-center justify-between px-3 py-2 bg-surface border-b border-surface">
                <span className="text-xs font-medium text-inkblack">
                  Unidad {idx + 1}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-brand">
                    {formatMoney(getUnitPrice(unit))}
                  </span>
                  {units.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeUnit(unit.unitId)}
                      className="text-muted-foreground hover:text-destructive transition-colors text-base leading-none"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Unit body */}
              <div className="px-3 py-2.5 flex flex-col gap-2.5">
                {/* Modificadores como chips */}
                {modifiers && item.haveModifiers && modifiers.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {modifiers.map((mod) => {
                      const selected = unit.modifiers.some(
                        (m) => m.id === mod.id,
                      );
                      return (
                        <button
                          key={mod.id}
                          type="button"
                          onClick={() => toggleModifier(unit.unitId, mod)}
                          className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-medium transition-all",
                            selected
                              ? "border-brand bg-brand/10 text-brand-dark"
                              : "border-surface bg-white text-muted-foreground hover:border-brand-light",
                          )}
                        >
                          <div
                            className={cn(
                              "w-3 h-3 rounded flex items-center justify-center border flex-shrink-0 transition-all",
                              selected
                                ? "bg-brand border-brand"
                                : "border-muted-foreground/30",
                            )}
                          >
                            {selected && (
                              <svg
                                width="7"
                                height="7"
                                viewBox="0 0 20 20"
                                fill="white"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="text-[10px]">{mod.name}</span>
                          <span className="text-muted-foreground">
                            +{formatMoney(mod.extraPrice)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Nota */}
                <textarea
                  value={unit.notes}
                  onChange={(e) => updateNote(unit.unitId, e.target.value)}
                  placeholder="Nota para cocina..."
                  rows={1}
                  className="w-full border border-input rounded-lg px-2.5 py-1.5 text-[12px] bg-surface focus:border-brand focus:bg-white outline-none resize-none transition-colors"
                />
              </div>
            </div>
          ))}

          {/* Agregar unidad */}
          <button
            type="button"
            onClick={addUnit}
            className="flex items-center justify-center gap-1.5 py-2.5 border-[1.5px] border-dashed border-surface rounded-xl text-xs text-muted-foreground hover:border-brand hover:text-brand hover:bg-orange-50 transition-all"
          >
            + Agregar unidad
          </button>
        </div>

        {/* Total bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-surface border-t border-surface flex-shrink-0">
          <span className="text-xs text-muted-foreground">
            Total {units.length} unidad{units.length !== 1 ? "es" : ""}
          </span>
          <span className="text-sm font-medium text-brand">
            {formatMoney(total)}
          </span>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-4 py-3 border-t border-surface flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 h-8 text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="flex-[2] h-8 bg-brand hover:bg-brand-dark text-white font-medium text-xs"
          >
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  );
}
