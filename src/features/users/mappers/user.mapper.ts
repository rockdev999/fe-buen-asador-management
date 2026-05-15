import { mapLocationDTOToModel } from "@/features/locations/mappers/location.mapper";
import {
  CreateUserDTO,
  UserDetailsDTO,
  UserDTO,
  UserLocationDTO,
  UserLocationItemDTO,
  UserLocationsDTO,
  UserPageItemDTO,
} from "../dto/user.dto";
import {
  User,
  UserDetails,
  UserLocation,
  UserLocationItem,
  UserLocations,
  UserPageItem,
} from "../models/user.model";
import { mapRoleDTOToModel } from "./role.mapper";
import { CreateUserForm } from "../validators/user.schema";

export const mapUserDTOToModel = (dto: UserDTO): User => ({
  id: dto.id,
  name: dto.name,
  email: dto.email,
});

export const mapUserDetailsDTOToModel = (dto: UserDetailsDTO): UserDetails => ({
  id: dto.id,
  name: dto.name,
  email: dto.email,
  role: dto.role,
  locationId: dto.location.id,
  locationName: dto.location.name,
});

export const mapUserLocationItemDTOToModel = (
  dto: UserLocationItemDTO,
): UserLocationItem => ({
  id: dto.id,
  name: dto.name,
  role: dto.role ? mapRoleDTOToModel(dto.role) : null,
});

export const mapUserPageItemDTOToModel = (
  dto: UserPageItemDTO,
): UserPageItem => ({
  id: dto.id,
  name: dto.name,
  email: dto.email,
  active: dto.active,
  createdAt: dto.createdAt,
  locations: dto.locations
    ? dto.locations.map(mapUserLocationItemDTOToModel)
    : null,
});

export const mapUserLocationDTOToModel = (
  dto: UserLocationDTO,
): UserLocation => ({
  id: dto.id,
  location: mapLocationDTOToModel(dto.location),
  role: dto.role ? mapRoleDTOToModel(dto.role) : null,
  activeLocation: dto.activeLocation,
});

export const mapUserLocationsDTOToModel = (
  dto: UserLocationsDTO,
): UserLocations => ({
  id: dto.id,
  name: dto.name,
  email: dto.email,
  active: dto.active,
  audit: dto.audit,
  locations: dto.locations.map(mapUserLocationDTOToModel),
});

export const mapCreateUserFormToDTO = (
  user: CreateUserForm,
): CreateUserDTO => ({
  name: user.name.trim(),
  email: user.email.trim().toLowerCase(),
  password: user.password.trim(),
});
