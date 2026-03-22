import { RoleEnum, TokenTypeEnum } from "@/constants/enums";

export interface User {
  id: string;
  name: string;
  email: string;
  rol: RoleEnum;
  locationId: string;
  active: boolean;
}

export interface Location {
  id: string;
  name: string;
  address?: string;
}

// Paso 1 — login
export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: TokenTypeEnum;
  locations: Location[];
}

// Paso 2 — seleccionar sucursal
export interface SelectLocationDto {
  locationId: string;
  token: string;
}

export interface SelectLocationResponse {
  token: string;
  tokenType: TokenTypeEnum;
  user: User;
}
