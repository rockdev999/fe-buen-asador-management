import { httpClient } from "@/services/http.client";
import { AUTH_ENDPOINTS } from "./auth.endpoints";
import {
  LoginLocationsDTO,
  LoginRequestDTO,
  SelectLocationDTO,
  SelectLocationRequestDTO,
} from "../dto/login.dto";

export const authFetch = {
  login: (dto: LoginRequestDTO) =>
    httpClient
      .post<LoginLocationsDTO>(AUTH_ENDPOINTS.LOGIN, dto)
      .then((r) => r.data),

  selectLocation: (dto: SelectLocationRequestDTO) =>
    httpClient
      .post<SelectLocationDTO>(AUTH_ENDPOINTS.SELECT_LOCATION, dto)
      .then((r) => r.data),
};
