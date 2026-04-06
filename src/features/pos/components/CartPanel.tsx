import { ORDER_TYPE_OPTIONS } from "@/constants/enums/pos.enum";
import { useCartStore } from "../stores/cart.store";
import { cn, formatMoney } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import { CartItem } from "./CartItem";
import { Button } from "@/components/ui/button";
import { t } from "@/locales/es";
import { MoneyInput } from "@/components/shared/Interactives/MoneyInput";
import { useState } from "react";
import { CartItem as CartItemType } from "../models/cart";
import { Modifier } from "../models/modifier";
import { CartItemEditModal } from "./CartItemEditModal";

const trans = t.pos.products;

interface CartPanelProps {
  onCheckout: () => void;
  isLoading?: boolean;
}

export function CartPanel({ onCheckout, isLoading }: CartPanelProps) {
  const items = useCartStore((state) => state.items);
  const discount = useCartStore((state) => state.discount);
  const updateDiscount = useCartStore((state) => state.updateDiscount);
  const orderType = useCartStore((state) => state.orderType);
  const updateQty = useCartStore((state) => state.updateQty);
  const updateItem = useCartStore((state) => state.updateItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const setOrderType = useCartStore((state) => state.setOrderType);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getTotal = useCartStore((state) => state.getTotal);

  const subtotal = getSubtotal();
  const total = getTotal();

  const [editingItem, setEditingItem] = useState<CartItemType | null>(null);

  function handleSaveItem(
    productId: string,
    notes: string,
    modifiers: Modifier[],
    quantity: number,
  ) {
    updateItem(productId, notes, modifiers, quantity);
    setEditingItem(null);
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Order type */}
        <div className="flex gap-1 p-2.5 border-b border-surface flex-shrink-0">
          {ORDER_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setOrderType(opt.value, opt.channel)}
              className={cn(
                "flex-1 py-1.5 text-[10px] font-medium rounded-lg border transition-all",
                orderType === opt.value
                  ? "bg-inkblack text-white border-inkblack"
                  : "text-muted-foreground border-surface hover:border-brand-light",
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
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
                <ShoppingCart size={18} className="text-brand/60" />
              </div>
              <span className="text-xs">{trans.addProducts}</span>
            </div>
          ) : (
            items.map((item) => (
              <CartItem
                key={item.productId}
                item={item}
                onUpdateQty={updateQty}
                onRemove={removeItem}
                onEdit={setEditingItem}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-surface flex-shrink-0">
          <div className="flex justify-between text-xs text-muted-foreground mb-1 me-3">
            <span>{trans.subtotal}</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          {/* <div className="flex justify-between text-xs text-muted-foreground mb-1 gap-16">
            <span className="content-center">{trans.discount}</span>
            <MoneyInput
              disabled={items.length === 0}
              className="h-8"
              id="amount"
              defaultValue={discount}
              placeholder="0.00"
              onChange={(value) => updateDiscount(value)}
            />
          </div> */}
          <div className="flex justify-between text-sm font-medium text-inkblack mb-3 me-3">
            <span>{trans.total}</span>
            <span>{formatMoney(total)}</span>
          </div>
          <Button
            type="button"
            disabled={items.length === 0}
            onClick={onCheckout}
            className="w-full bg-brand hover:bg-brand-dark text-white font-medium text-sm h-9"
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
