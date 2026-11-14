import { mapUserDTOToModel } from "@/features/users/mappers/user.mapper";
import {
  LoginLocationsDTO,
  LoginRequestDTO,
  SelectLocationDTO,
  SessionResponseDTO,
} from "../dto/login.dto";
import { LoginForm } from "../forms/login.form";
import { LoginLocations } from "../models/login.model";
import { mapLocationWithRoleDTOToModel } from "@/features/locations/mappers/location.mapper";
import { AuthUser } from "../models/auth.model";
import { mapUserDetailsDTOToModel } from "@/features/users/mappers/user.mapper";
import type { AuthSession } from "@/stores/auth.store";

export const mapSessionDTOToModel = (dto: SessionResponseDTO): AuthSession => ({
  user: mapUserDetailsDTOToModel(dto.user),
  accessToken: dto.accessToken,
  refreshToken: dto.refreshToken,
  expiresIn: dto.expiresIn,
});

export const mapLoginFormToDTO = (form: LoginForm): LoginRequestDTO => ({
  identifier: form.identifier,
  password: form.password,
});

export const mapLoginDTOToModel = (dto: LoginLocationsDTO): LoginLocations => ({
  temporaryToken: dto.temporaryToken,
  user: mapUserDTOToModel(dto.user),
  locations: dto.locations.map(mapLocationWithRoleDTOToModel),
});

export const mapAuthUserDTOToModel = (dto: SelectLocationDTO): AuthUser => ({
  id: dto.user.id,
  name: dto.user.name,
  email: dto.user.email,
  role: dto.user.role,
  locationId: dto.user.location?.id ?? null,
  locationName: dto.user.location?.name ?? null,
});
