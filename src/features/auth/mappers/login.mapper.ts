import { mapUserDTOToModel } from "@/features/users/mappers/user.mapper";
import {
  LoginLocationsDTO,
  LoginRequestDTO,
  SelectLocationDTO,
} from "../dto/login.dto";
import { LoginForm } from "../forms/login.form";
import { LoginLocations } from "../models/login.model";
import { mapLocationDTOToModel } from "@/features/locations/mappers/location.mapper";
import { AuthUser } from "../models/auth.model";

export const mapLoginFormToDTO = (form: LoginForm): LoginRequestDTO => ({
  email: form.email,
  password: form.password,
});

export const mapLoginDTOToModel = (dto: LoginLocationsDTO): LoginLocations => ({
  temporaryToken: dto.temporaryToken,
  user: mapUserDTOToModel(dto.user),
  locations: dto.locations.map(mapLocationDTOToModel),
});

export const mapAuthUserDTOToModel = (dto: SelectLocationDTO): AuthUser => ({
  id: dto.user.id,
  name: dto.user.name,
  email: dto.user.email,
  role: dto.user.role,
  locationId: dto.user.location.id,
  locationName: dto.user.location.name,
});
