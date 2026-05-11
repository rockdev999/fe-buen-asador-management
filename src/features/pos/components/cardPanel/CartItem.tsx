import { Minus, Pencil, Plus, Trash2, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CartItem as CartItemType } from "../../models/cart";
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.productId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const lineTotal = item.units.reduce((sum, unit) => {
    const unitExtra = unit.modifiers.reduce((s, m) => s + m.extraPrice, 0);
    return sum + item.price + unitExtra;
  }, 0);

  const allMods = item.units.flatMap((u) => u.modifiers);
  const uniqueMods = [...new Map(allMods.map((m) => [m.id, m])).values()];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 py-2.5 border-b border-surface/60"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-0.5 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
      >
        <GripVertical size={14} />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-inkblack truncate">
          {item.name}
        </p>
        {uniqueMods.length > 0 && (
          <p className="text-[10px] text-brand-light mt-0.5">
            con modificadores
          </p>
        )}
        {/* {item.modifiers.length > 0 && (
          <p className="text-[9px] text-brand-light mt-0.5">
            + {item.modifiers.map((m) => m.name).join(", ")}
          </p>
        )} */}
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
        <span className="text-sm font-medium text-brand">
          {formatMoney(lineTotal)}
        </span>
        <div className="flex gap-1">
          {/* {item.haveModifiers && ( */}
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="w-8 h-8 rounded border border-surface flex items-center justify-center 
             text-neutral-500 hover:text-inkblack 
             hover:border-neutral-300 hover:bg-neutral-100 
             transition-colors"
          >
            <Pencil size={14} />
          </button>
          {/* )} */}
          <button
            type="button"
            onClick={() => onRemove(item.productId)}
            className="w-8 h-8 rounded border border-surface flex items-center justify-center 
             text-danger hover:text-white 
             hover:bg-danger hover:border-danger 
             transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
