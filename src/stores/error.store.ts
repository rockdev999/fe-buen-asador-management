import { create } from "zustand";

export interface AppError {
  message: string;
  type: "error" | "warning" | "info";
}

interface ErrorState {
  error: AppError | null;
  setError: (error: AppError) => void;
  clear: () => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  error: null,
  setError: (error) => set({ error }),
  clear: () => set({ error: null }),
}));
