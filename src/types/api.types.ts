export interface ApiMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data?: T;
  meta?: ApiMeta;
}

export interface ApiErrorResponse {
  code: number;
  errorCode: string;
  message: string;
  errors: { field: string; message: string }[];
  timestamp: string;
  path: string;
}
