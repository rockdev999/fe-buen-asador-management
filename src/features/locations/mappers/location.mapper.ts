import { mapUserWithLocationDTOToModel } from "@/features/users/mappers/user.mapper";
import {
  CreateLocationDTO,
  LocationDetailDTO,
  LocationDTO,
  LocationPageItemDTO,
  LocationSimpleDTO,
  LocationWithRoleDTO,
} from "../dto/location.dto";
import {
  Location,
  LocationDetail,
  LocationPageItem,
  LocationSimple,
  LocationWithRole,
} from "../models/location.model";
import { LocationForm } from "../forms/location.form";

export const mapLocationWithRoleDTOToModel = (
  dto: LocationWithRoleDTO,
): LocationWithRole => ({
  id: dto.id,
  name: dto.name,
  role: dto.role,
});

export const mapLocationDTOToModel = (dto: LocationDTO): Location => ({
  id: dto.id,
  name: dto.name,
});

export const mapLocationSimpleDTOToModel = (
  dto: LocationSimpleDTO,
): LocationSimple => ({
  id: dto.id,
  name: dto.name,
  active: dto.active,
});

export const mapLocationPageItemDTOToModel = (
  dto: LocationPageItemDTO,
): LocationPageItem => ({
  id: dto.id,
  name: dto.name,
  address: dto.address,
  active: dto.active,
  admins: dto.admins.map((admin) => ({
    id: admin.id,
    name: admin.name,
  })),
  createdAt: dto.createdAt,
});

export const mapLocationsDetailDTOToModel = (
  dto: LocationDetailDTO,
): LocationDetail => ({
  id: dto.id,
  name: dto.name,
  address: dto.address,
  active: dto.active,
  users: dto.users.map(mapUserWithLocationDTOToModel),
  stats: {
    totalActiveUsers: dto.stats?.totalActiveUsers ?? 0,
    activeShift: {
      isOpen: dto.stats?.activeShift.isOpen ?? false,
      openedBy: dto.stats?.activeShift.openedBy
        ? {
            id: dto.stats?.activeShift.openedBy.id ?? "",
            name: dto.stats?.activeShift.openedBy.name ?? "",
          }
        : null,
      openedAt: dto.stats?.activeShift.openedAt ?? null,
    },
  },
  audit: dto.audit,
});

export const mapCreateLocationFormToDTO = (
  form: LocationForm,
): CreateLocationDTO => ({
  name: form.name,
  address: form.address,
});
