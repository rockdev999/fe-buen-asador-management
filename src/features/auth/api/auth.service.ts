import { httpClient } from "@/services/http.client";
import { ApiResponse } from "@/types/api.types";
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
      .post<ApiResponse<LoginLocationsDTO>>(AUTH_ENDPOINTS.LOGIN, dto)
      .then((r) => r.data.data!),

  selectLocation: (dto: SelectLocationRequestDTO) =>
    httpClient
      .post<ApiResponse<SelectLocationDTO>>(AUTH_ENDPOINTS.SELECT_LOCATION, dto)
      .then((r) => r.data.data!),
};
