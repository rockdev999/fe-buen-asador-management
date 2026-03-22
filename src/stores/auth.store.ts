import { Location, User } from "@/types/auth.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  // Estado paso 1
  tempToken: string | null;
  locations: Location[];

  // Estado paso 2 (sesión completa)
  user: User | null;
  token: string | null;

  // Acciones
  setTempAuth: (tempToken: string, locations: Location[]) => void;
  setFullAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      tempToken: null,
      locations: [],
      user: null,
      token: null,

      setTempAuth: (tempToken, locations) =>
        set({ tempToken, locations, user: null, token: null }),

      setFullAuth: (user, token) =>
        set({ user, token, tempToken: null, locations: [] }),

      logout: () =>
        set({ user: null, token: null, tempToken: null, locations: [] }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        tempToken: state.tempToken,
        locations: state.locations,
      }),
    },
  ),
);
