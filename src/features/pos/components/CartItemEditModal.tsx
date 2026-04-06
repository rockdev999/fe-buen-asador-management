import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModifiers } from "../hooks/useModifiers";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/utils";
import type { CartItem } from "../models/cart";
import type { Modifier } from "../models/modifier";

interface CartItemEditModalProps {
  item: CartItem;
  onSave: (
    productId: string,
    notes: string,
    modifiers: Modifier[],
    quantity: number,
  ) => void;
  onClose: () => void;
}

export function CartItemEditModal({
  item,
  onSave,
  onClose,
}: CartItemEditModalProps) {
  const { data: modifiers, status } = useModifiers();

  const [selectedMods, setSelectedMods] = useState<Modifier[]>(item.modifiers);
  const [notes, setNotes] = useState(item.notes);
  const [quantity, setQuantity] = useState(item.quantity);

  // Modificadores — precio por unidad (no × cantidad)
  const modifiersExtra = selectedMods.reduce((s, m) => s + m.extraPrice, 0);
  // Subtotal = (precio base + extras por unidad) × cantidad
  const subtotal = (item.price + modifiersExtra) * quantity;

  function toggleModifier(mod: Modifier) {
    setSelectedMods((prev) => {
      const exists = prev.find((m) => m.id === mod.id);
      if (exists) return prev.filter((m) => m.id !== mod.id);
      return [
        ...prev,
        { id: mod.id, name: mod.name, extraPrice: mod.extraPrice },
      ];
    });
  }

  function isSelected(modId: string) {
    return selectedMods.some((m) => m.id === modId);
  }

  function handleQty(delta: number) {
    setQuantity((prev) => Math.max(1, prev + delta));
  }

  function handleSave() {
    onSave(item.productId, notes, selectedMods, quantity);
    onClose();
  }

  return (
    <div className="absolute inset-0 bg-inkblack/55 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[300px] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-4 py-3.5 border-b border-surface">
          <div>
            <p className="text-sm font-medium text-inkblack">{item.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Editar item del pedido
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-medium text-brand">
              {formatMoney(item.price)}
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

        {/* Body */}
        <div className="px-4 py-3 flex flex-col gap-4 max-h-72 overflow-y-auto">
          {/* Modificadores */}
          <div>
            <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Modificadores
            </p>
            {status === "pending" && (
              <p className="text-xs text-muted-foreground">Cargando...</p>
            )}
            {modifiers?.map((mod) => (
              <button
                key={mod.id}
                type="button"
                onClick={() => toggleModifier(mod)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg border-[1.5px] mb-1.5 transition-all text-left",
                  isSelected(mod.id)
                    ? "border-brand bg-orange-50"
                    : "border-surface hover:border-brand-light",
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-4 h-4 rounded flex items-center justify-center border-[1.5px] transition-all flex-shrink-0",
                      isSelected(mod.id)
                        ? "bg-brand border-brand"
                        : "border-muted-foreground/30",
                    )}
                  >
                    {isSelected(mod.id) && (
                      <svg
                        width="9"
                        height="9"
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
                  <span className="text-xs text-inkblack">{mod.name}</span>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isSelected(mod.id) ? "text-brand" : "text-muted-foreground",
                  )}
                >
                  + {formatMoney(mod.extraPrice)}
                </span>
              </button>
            ))}
            {modifiers?.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Sin modificadores disponibles
              </p>
            )}
          </div>

          {/* Nota */}
          <div>
            <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Nota para cocina
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Sin sal, término medio..."
              rows={2}
              className="w-full border border-input rounded-lg px-3 py-2 text-xs bg-surface focus:border-brand focus:bg-white outline-none resize-none transition-colors"
            />
          </div>

          {/* Subtotal — con control de cantidad */}
          <div className="flex items-center justify-between bg-surface rounded-lg px-3 py-2">
            <span className="text-xs text-muted-foreground">Subtotal</span>
            <div className="flex items-center gap-2">
              {/* Cantidad */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQty(-1)}
                  disabled={quantity <= 1}
                  className="w-5 h-5 rounded-full border border-surface bg-white flex items-center justify-center hover:border-brand hover:bg-brand hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Minus size={10} />
                </button>
                <span className="text-xs font-medium text-inkblack w-5 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQty(1)}
                  className="w-5 h-5 rounded-full border border-surface bg-white flex items-center justify-center hover:border-brand hover:bg-brand hover:text-white transition-colors"
                >
                  <Plus size={10} />
                </button>
              </div>

              <span className="text-xs text-muted-foreground">×</span>

              {/* Precio unitario con modificadores */}
              <div className="text-right">
                <span className="text-xs font-medium text-brand">
                  {formatMoney(subtotal)}
                </span>
                {modifiersExtra > 0 && (
                  <p className="text-[9px] text-muted-foreground">
                    {formatMoney(item.price + modifiersExtra)}/u
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-4 py-3 border-t border-surface">
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
