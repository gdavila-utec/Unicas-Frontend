// Common API response type
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Axios wrapped response type
export interface AxiosResponseData<T> {
  data: ApiResponse<T>;
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
  type?: 'cors' | 'network' | 'auth' | 'validation' | 'unknown';
  attempt?: number;
  maxAttempts?: number;
}

export interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

// Query response types
export type JuntaQueryResponse = ApiResponse<any>;
export type MemberQueryResponse = ApiResponse<any>;
export type CapitalQueryResponse = ApiResponse<{ available_capital: number }>;
