import { RoleEnum, TokenTypeEnum } from "@/constants/enums";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: RoleEnum;
  sucursalId: string;
  activo: boolean;
}

export interface Sucursal {
  id: string;
  nombre: string;
  direccion?: string;
}

// Paso 1 — login
export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: TokenTypeEnum;
  sucursales: Sucursal[];
}

// Paso 2 — seleccionar sucursal
export interface SelectLocationDto {
  locationId: string;
  token: string;
}

export interface SelectLocationResponse {
  token: string;
  tokenType: TokenTypeEnum;
  usuario: Usuario;
}
