import { LocationWithRole } from "@/features/locations/models/location.model";
import { UserDetails } from "@/features/users/models/user.model";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  // Estado paso 1
  tempToken: string | null;
  locations: LocationWithRole[];

  // Estado paso 2 (sesión completa)
  user: UserDetails | null;
  token: string | null;

  // Acciones
  setTempAuth: (tempToken: string, locations: LocationWithRole[]) => void;
  setFullAuth: (user: UserDetails, token: string) => void;
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
