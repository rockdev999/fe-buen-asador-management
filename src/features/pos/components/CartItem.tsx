import { Minus, Pencil, Plus, Trash2 } from "lucide-react";
import { CartItem as CartItemType } from "../models/cart";
import { formatMoney } from "@/lib/utils";

interface CartItemProps {
  item: CartItemType;
  onUpdateQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  onEdit: (item: CartItemType) => void;
}

export function CartItem({
  item,
  onUpdateQty,
  onRemove,
  onEdit,
}: CartItemProps) {
  const modifiersExtra = item.modifiers.reduce((s, m) => s + m.extraPrice, 0);
  const lineTotal = (item.price + modifiersExtra) * item.quantity;

  return (
    <div className="flex items-start gap-2 py-2.5 border-b border-surface/60">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-inkblack truncate">
          {item.name}
        </p>
        {item.modifiers.length > 0 && (
          <p className="text-[9px] text-brand-light mt-0.5">
            + {item.modifiers.map((m) => m.name).join(", ")}
          </p>
        )}
        {item.notes && (
          <p className="text-[10px] text-muted-foreground italic mt-0.5">
            "{item.notes}"
          </p>
        )}
        <div className="flex items-center gap-1.5 mt-1.5">
          <button
            type="button"
            onClick={() => onUpdateQty(item.productId, item.quantity - 1)}
            className="w-5 h-5 rounded-full border border-surface bg-surface flex items-center justify-center hover:border-brand hover:bg-brand hover:text-white transition-colors"
          >
            <Minus size={10} />
          </button>
          <span className="text-xs font-medium text-inkblack w-4 text-center">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onUpdateQty(item.productId, item.quantity + 1)}
            className="w-5 h-5 rounded-full border border-surface bg-surface flex items-center justify-center hover:border-brand hover:bg-brand hover:text-white transition-colors"
          >
            <Plus size={10} />
          </button>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className="text-xs font-medium text-brand">
          {formatMoney(lineTotal)}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="w-7 h-7 rounded border border-surface flex items-center justify-center 
             text-neutral-500 hover:text-inkblack 
             hover:border-neutral-300 hover:bg-neutral-100 
             transition-colors"
          >
            <Pencil size={12} />
          </button>
          <button
            type="button"
            onClick={() => onRemove(item.productId)}
            className="w-7 h-7 rounded border border-surface flex items-center justify-center 
             text-danger hover:text-white 
             hover:bg-danger hover:border-danger 
             transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
