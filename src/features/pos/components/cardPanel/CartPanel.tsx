import { ORDER_TYPE_OPTIONS } from "@/constants/enums/pos.enum";
import { useCartStore } from "../../stores/cart.store";
import { cn, formatMoney } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import { CartItem } from "./CartItem";
import { Button } from "@/components/ui/button";
import { t } from "@/locales/es";
import { useState } from "react";
import { CartItem as CartItemType, CartItemUnit } from "../../models/cart";
import { CartItemEditModal } from "./CartItemEditModal";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const trans = t.pos.products;

interface CartPanelProps {
  onCheckout: () => void;
}

export function CartPanel({ onCheckout }: CartPanelProps) {
  const items = useCartStore((state) => state.items);
  const orderType = useCartStore((state) => state.orderType);
  const updateQty = useCartStore((state) => state.updateQty);
  const updateItem = useCartStore((state) => state.updateItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const setOrderType = useCartStore((state) => state.setOrderType);
  const reorderItems = useCartStore((s) => s.reorderItems);
  const getSubtotal = useCartStore((state) => state.getSubtotal);

  const subtotal = getSubtotal();

  const [editingItem, setEditingItem] = useState<CartItemType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((i) => i.productId === active.id);
    const newIdx = items.findIndex((i) => i.productId === over.id);
    if (oldIdx !== -1 && newIdx !== -1) {
      reorderItems(arrayMove(items, oldIdx, newIdx));
    }
  }

  function handleSaveItem(productId: string, units: CartItemUnit[]) {
    updateItem(productId, units);
    setEditingItem(null);
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex gap-1 p-2.5 border-b border-surface flex-shrink-0">
          {ORDER_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setOrderType(opt.value, opt.channel)}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg border transition-all",
                orderType === opt.value
                  ? "bg-success text-white border-successDark shadow-sm hover:bg-successDark"
                  : "text-muted-foreground border-successLight hover:border-successLight hover:bg-successLight hover:text-inkblack",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-3 py-1">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
              <div className="w-20 h-20 bg-brand/10 rounded-xl flex items-center justify-center">
                <ShoppingCart size={35} className="text-brand/60" />
              </div>
              <span className="text-sm">{trans.addProducts}</span>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((i) => i.productId)}
                strategy={verticalListSortingStrategy}
              >
                {items.map((item) => (
                  <CartItem
                    key={item.productId}
                    item={item}
                    onUpdateQty={updateQty}
                    onRemove={removeItem}
                    onEdit={setEditingItem}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-surface flex-shrink-0">
          <div className="flex justify-between text-md font-medium text-inkblack mb-3 me-3">
            <span>{trans.subtotal}</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <Button
            type="button"
            disabled={items.length === 0}
            onClick={onCheckout}
            className="w-full bg-brand hover:bg-brand-dark text-white font-medium text-md h-9"
          >
            {trans.checkout}
          </Button>
        </div>
      </div>
      {/* Modal edición */}
      {editingItem && (
        <CartItemEditModal
          item={editingItem}
          onSave={handleSaveItem}
          onClose={() => setEditingItem(null)}
        />
      )}
    </>
  );
}
