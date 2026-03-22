import { httpClient } from "@/services/http.client";
import { ApiResponse } from "@/types/api.types";
import {
  LoginDto,
  LoginResponse,
  SelectLocationDto,
  SelectLocationResponse,
} from "@/types/auth.types";
import { AUTH_ENDPOINTS } from "./auth.endpoints";

export const authFetch = {
  login: (dto: LoginDto) =>
    httpClient
      .post<ApiResponse<LoginResponse>>(AUTH_ENDPOINTS.LOGIN, dto)
      .then((r) => r.data.data!),

  selectLocation: (dto: SelectLocationDto) =>
    httpClient
      .post<
        ApiResponse<SelectLocationResponse>
      >(AUTH_ENDPOINTS.SELECT_LOCATION, dto)
      .then((r) => r.data.data!),
};
