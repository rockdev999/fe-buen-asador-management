import { OrderEnum, OrderTypeEnum } from "@/constants";
import { CartItem } from "../models/cart";
import { Product } from "@/features/products/models/product.model";
import { create } from "zustand";
import { Modifier } from "../models/modifier";

interface CartState {
  items: CartItem[];
  orderType: OrderTypeEnum;
  orderChannel: OrderEnum;
  customerName: string;

  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  updateItem: (
    productId: string,
    notes: string,
    modifiers: Modifier[],
    quantity: number,
  ) => void;
  setOrderType: (type: OrderTypeEnum, channel: OrderEnum) => void;
  setCustomer: (name: string) => void;
  clearCart: () => void;

  discount: number;
  updateDiscount: (amount: number) => void;

  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  orderType: OrderTypeEnum.DINE_IN,
  orderChannel: OrderEnum.IN_STORE,
  customerName: "Cliente",
  discount: 0,

  addItem: (product) => {
    const existing = get().items.find((i) => i.productId === product.id);

    if (existing) {
      set((s) => ({
        items: s.items.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      }));
    } else {
      set((s) => ({
        items: [
          ...s.items,
          {
            productId: product.id,
            name: product.name,
            price: Number(product.price) || 0,
            quantity: 1,
            notes: "",
            modifiers: [],
          },
        ],
      }));
    }
  },

  removeItem: (productId) =>
    set((s) => ({
      items: s.items.filter((i) => i.productId !== productId),
    })),

  updateQty: (productId, qty) => {
    if (qty <= 0) {
      get().removeItem(productId);
      return;
    }

    set((s) => ({
      items: s.items.map((i) =>
        i.productId === productId ? { ...i, quantity: qty } : i,
      ),
    }));
  },

  updateItem: (productId, notes, modifiers, quantity) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.productId === productId ? { ...i, notes, modifiers, quantity } : i,
      ),
    })),

  setOrderType: (type, channel) =>
    set({ orderType: type, orderChannel: channel }),

  setCustomer: (name) => set({ customerName: name }),

  clearCart: () => set({ items: [], customerName: "Cliente", discount: 0 }),

  updateDiscount: (amount) => {
    const subtotal = get().getSubtotal();
    const safeAmount = Math.max(0, Math.min(Number(amount) || 0, subtotal));
    set({ discount: safeAmount });
  },

  getSubtotal: () => {
    return (
      Math.round(
        get().items.reduce((sum, item) => {
          const price = Number(item.price) || 0;
          const qty = Number(item.quantity) || 0;
          return sum + price * qty;
        }, 0) * 100,
      ) / 100
    );
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = Number(get().discount) || 0;
    return Math.round((subtotal - discount) * 100) / 100;
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
