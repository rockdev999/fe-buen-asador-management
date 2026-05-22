import { mapLocationDTOToModel } from "@/features/locations/mappers/location.mapper";
import {
  CreateUserDTO,
  UserDetailsDTO,
  UserDTO,
  UserLocationDTO,
  UserLocationItemDTO,
  UserLocationsDTO,
  UserPageItemDTO,
  UserSimpleDTO,
  UserWithLocationDTO,
} from "../dto/user.dto";
import {
  User,
  UserDetails,
  UserLocation,
  UserLocationItem,
  UserLocations,
  UserPageItem,
  UserSimple,
  UserWithLocation,
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
  username: dto.username,
  email: dto.email,
  phone: dto.phone,
  positions: dto.positions,
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
  firstName: dto.firstName,
  lastName: dto.lastName,
  username: dto.username,
  email: dto.email,
  active: dto.active,
  description: dto.description ? dto.description : "",
  positions: dto.positions,
  locations: dto.locations.map(mapUserLocationDTOToModel),
  audit: dto.audit,
});

export const mapCreateUserFormToDTO = (
  user: CreateUserForm,
  isEdit: boolean,
): CreateUserDTO => {
  const createDTO = {
    firstName: user.firstName.trim(),
    lastName: user.lastName.trim(),
    username: user.username.trim(),
    email: user.email.trim().toLowerCase(),
    password: user.password.trim(),
    description: user.description ? user.description.trim() : "",
    positions: user.positions ? user.positions : [],
  };

  const editDTO = {
    firstName: user.firstName.trim(),
    lastName: user.lastName.trim(),
    username: user.username.trim(),
    email: user.email.trim().toLowerCase(),
    description: user.description ? user.description.trim() : "",
    positions: user.positions ? user.positions : [],
  };
  return isEdit ? editDTO : createDTO;
};

export const mapUserWithLocationDTOToModel = (
  dto: UserWithLocationDTO,
): UserWithLocation => ({
  userLocationId: dto.userLocationId,
  id: dto.id,
  name: dto.name,
  email: dto.email,
  role: dto.role ? mapRoleDTOToModel(dto.role) : null,
  activeLocation: dto.activeLocation,
});

export const mapUserSimpleDTOToModel = (dto: UserSimpleDTO): UserSimple => ({
  id: dto.id,
  name: dto.name,
  username: dto.username,
  positions: dto.positions,
  locations: dto.locations
    ? dto.locations.map(mapUserLocationItemDTOToModel)
    : [],
});
