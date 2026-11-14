import { LocationWithRoleDTO } from "@/features/locations/dto/location.dto";
import { UserDetailsDTO, UserDTO } from "@/features/users/dto/user.dto";
import { UUID } from "@/types/common";

export interface LoginRequestDTO {
  identifier: string;
  password: string;
}

export interface LoginLocationsDTO {
  temporaryToken: string;
  user: UserDTO;
  locations: LocationWithRoleDTO[];
}

export interface SelectLocationRequestDTO {
  locationId: UUID | null;
}

/**
 * Respuesta de POST /auth/select-location y POST /auth/refresh.
 * Las respuestas de /auth llegan sin el envoltorio { code, message, data }.
 */
export interface SessionResponseDTO {
  accessToken: string;
  /** Segundos de vida del access token. */
  expiresIn: number;
  /** Nuevo en cada refresh: siempre reemplazar el guardado. */
  refreshToken: string;
  /** ISO en UTC. */
  refreshTokenExpiresAt: string;
  user: UserDetailsDTO & { mustChangePassword: boolean };
}

/** @deprecated Usar SessionResponseDTO. */
export type SelectLocationDTO = SessionResponseDTO;

export interface RefreshSessionRequestDTO {
  refreshToken: string;
}

export interface LogoutRequestDTO {
  refreshToken: string;
}
