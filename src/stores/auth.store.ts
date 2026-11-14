import { LocationWithRole } from "@/features/locations/models/location.model";
import { UserDetails } from "@/features/users/models/user.model";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const STORAGE_KEY = "auth-storage";

/** Sesión completa que devuelven POST /auth/select-location y /auth/refresh. */
export interface AuthSession {
  user: UserDetails;
  accessToken: string;
  refreshToken: string;
  /** Segundos de vida del access token. */
  expiresIn: number;
}

interface AuthState {
  // Estado paso 1
  tempToken: string | null;
  locations: LocationWithRole[];

  // Estado paso 2 (sesión completa)
  user: UserDetails | null;
  token: string | null;
  refreshToken: string | null;
  /** Epoch (ms) en que vence el access token; para renovarlo antes de tiempo. */
  accessTokenExpiresAt: number | null;

  // Acciones
  setTempAuth: (tempToken: string, locations: LocationWithRole[]) => void;
  /**
   * Guarda una sesión completa (al elegir sucursal o al renovar). Reemplaza
   * ambos tokens y el user, porque el rol/sucursal pudo cambiar en el backend.
   */
  setSession: (session: AuthSession) => void;
  logout: () => void;
}

const EMPTY_SESSION = {
  user: null,
  token: null,
  refreshToken: null,
  accessTokenExpiresAt: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      tempToken: null,
      locations: [],
      ...EMPTY_SESSION,

      setTempAuth: (tempToken, locations) =>
        set({ tempToken, locations, ...EMPTY_SESSION }),

      setSession: ({ user, accessToken, refreshToken, expiresIn }) =>
        set({
          user,
          token: accessToken,
          refreshToken,
          accessTokenExpiresAt: Date.now() + expiresIn * 1000,
          tempToken: null,
          locations: [],
        }),

      logout: () => set({ tempToken: null, locations: [], ...EMPTY_SESSION }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        accessTokenExpiresAt: state.accessTokenExpiresAt,
        tempToken: state.tempToken,
        locations: state.locations,
      }),
    },
  ),
);

// ─── Sincronización entre pestañas ────────────────────────────────────────────
// El refresh token rota en cada renovación. Si otra pestaña lo rota y esta se
// queda con el viejo, al usarlo el backend lo detecta como reutilización (robo)
// y revoca la sesión en todas las pestañas. El evento `storage` solo se dispara
// en las OTRAS pestañas, así que basta con releer el estado persistido.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      void useAuthStore.persist.rehydrate();
    }
  });
}
