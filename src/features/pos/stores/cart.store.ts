import { OrderEnum, OrderTypeEnum } from "@/constants";
import { CartItem } from "../models/cart";
import { Product } from "@/features/products/models/product.model";
import { create } from "zustand";

interface CartState {
  items: CartItem[];
  orderType: OrderTypeEnum;
  orderChannel: OrderEnum;
  customerName: string; // TODO: creo que no es necesario aqui

  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  updateNotes: (productId: string, notes: string) => void;
  setOrderType: (type: OrderTypeEnum, channel: OrderEnum) => void;
  setCustomer: (name: string) => void;
  clearCart: () => void;

  total: number;
  itemCount: number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  orderType: OrderTypeEnum.DINE_IN,
  orderChannel: OrderEnum.IN_STORE,
  customerName: "Cliente",

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
            price: product.price,
            quantity: 1,
            notes: "",
          },
        ],
      }));
    }
  },

  removeItem: (productId) =>
    set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),

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

  updateNotes: (productId, notes) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.productId === productId ? { ...i, notes } : i,
      ),
    })),

  setOrderType: (type, channel) =>
    set({ orderType: type, orderChannel: channel }),

  setCustomer: (name) => set({ customerName: name }),

  clearCart: () => set({ items: [], customerName: "Cliente" }),

  get total() {
    return (
      Math.round(
        get().items.reduce((s, i) => s + i.price * i.quantity, 0) * 100,
      ) / 100
    );
  },

  get itemCount() {
    return get().items.reduce((s, i) => s + i.quantity, 0);
  },
}));
