import { OrderEnum, OrderTypeEnum } from "@/constants";
import { CartItem, CartItemUnit } from "../models/cart";
import { create } from "zustand";
import { CategoryProduct } from "../../catalog/categories/models/category.model";

interface CartState {
  items: CartItem[];
  orderType: OrderTypeEnum;
  orderChannel: OrderEnum;
  customerName: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  deliveryReference: string | null;

  addItem: (product: CategoryProduct) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  updateItem: (productId: string, units: CartItemUnit[]) => void;
  setOrderType: (type: OrderTypeEnum, channel: OrderEnum) => void;
  setCustomer: (name: string) => void;
  setCustomerPhone: (phone: string) => void;
  setCustomerAddress: (address: string) => void;
  setDeliveryReference: (reference: string) => void;
  clearCart: () => void;

  discount: number;
  updateDiscount: (amount: number) => void;

  reorderItems: (items: CartItem[]) => void;

  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  orderType: OrderTypeEnum.DINE_IN,
  orderChannel: OrderEnum.IN_STORE,
  customerName: null,
  customerPhone: null,
  customerAddress: null,
  deliveryReference: null,
  discount: 0,

  addItem: (product) => {
    const existing = get().items.find((i) => i.productId === product.id);

    if (existing) {
      set((s) => ({
        items: s.items.map((i) =>
          i.productId === product.id
            ? {
                ...i,
                quantity: i.quantity + 1,
                units: [
                  ...i.units,
                  { unitId: crypto.randomUUID(), modifiers: [], notes: "" },
                ],
              }
            : i,
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
            haveModifiers: product.haveModifiers,
            modifiers: [],
            units: [{ unitId: crypto.randomUUID(), modifiers: [], notes: "" }],
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
      items: s.items.map((i) => {
        if (i.productId !== productId) return i;

        const currentQty = i.units.length;
        let newUnits = [...i.units];

        if (qty > currentQty) {
          // Agregar unidades nuevas vacías
          const toAdd = qty - currentQty;
          for (let j = 0; j < toAdd; j++) {
            newUnits.push({
              unitId: crypto.randomUUID(),
              modifiers: [],
              notes: "",
            });
          }
        } else if (qty < currentQty) {
          // Quitar las últimas unidades
          newUnits = newUnits.slice(0, qty);
        }

        return { ...i, quantity: qty, units: newUnits };
      }),
    }));
  },

  updateItem: (productId, units) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.productId === productId ? { ...i, quantity: units.length, units } : i,
      ),
    })),

  setOrderType: (type, channel) =>
    set({ orderType: type, orderChannel: channel }),

  setCustomer: (name) => set({ customerName: name }),
  setCustomerPhone: (phone) => set({ customerPhone: phone }),
  setCustomerAddress: (address) => set({ customerAddress: address }),
  setDeliveryReference: (reference) => set({ deliveryReference: reference }),

  clearCart: () =>
    set({
      items: [],
      customerName: null,
      customerPhone: null,
      customerAddress: null,
      deliveryReference: null,
      discount: 0,
    }),

  updateDiscount: (amount) => {
    set({ discount: amount });
  },

  reorderItems: (newItems) => set({ items: newItems }),

  getSubtotal: () => {
    return (
      Math.round(
        get().items.reduce((sum, item) => {
          const price = Number(item.price) || 0;

          // Si tiene units, sumar cada unidad con sus propios modificadores
          if (item.units.length > 0) {
            const itemTotal = item.units.reduce((us, unit) => {
              const modExtra = unit.modifiers.reduce(
                (ms, m) => ms + m.extraPrice,
                0,
              );
              return us + price + modExtra;
            }, 0);
            return sum + itemTotal;
          }

          // Fallback sin units
          return sum + price * item.quantity;
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
