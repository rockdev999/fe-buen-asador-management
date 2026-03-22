import { Sucursal, Usuario } from "@/types/auth.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  // Estado paso 1
  tempToken: string | null;
  sucursales: Sucursal[];

  // Estado paso 2 (sesión completa)
  usuario: Usuario | null;
  token: string | null;

  // Acciones
  setTempAuth: (tempToken: string, sucursales: Sucursal[]) => void;
  setFullAuth: (usuario: Usuario, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      tempToken: null,
      sucursales: [],
      usuario: null,
      token: null,

      setTempAuth: (tempToken, sucursales) =>
        set({ tempToken, sucursales, usuario: null, token: null }),

      setFullAuth: (usuario, token) =>
        set({ usuario, token, tempToken: null, sucursales: [] }),

      logout: () =>
        set({ usuario: null, token: null, tempToken: null, sucursales: [] }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        usuario: state.usuario,
        token: state.token,
        tempToken: state.tempToken,
        sucursales: state.sucursales,
      }),
    },
  ),
);
