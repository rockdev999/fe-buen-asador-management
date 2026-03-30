import { create } from "zustand";
import { Shift } from "../models/shift";
import { persist } from "zustand/middleware";

interface CashierState {
  activeShift: Shift | null;
  setActiveShift: (shift: Shift | null) => void;
  clearShift: () => void;
}

export const useCashierStore = create<CashierState>()(
  persist(
    (set) => ({
      activeShift: null,
      setActiveShift: (shift: Shift | null) => set({ activeShift: shift }),
      clearShift: () => set({ activeShift: null }),
    }),
    {
      name: "cashier-storage",
      partialize: (state) => ({
        activeShift: state.activeShift,
      }),
    },
  ),
);
