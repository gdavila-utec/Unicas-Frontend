// utils/api.ts
import axios, { AxiosError, AxiosResponse } from 'axios';
import axiosInstance from './axios';
import useAuthStore from '../store/useAuthStore';
import { apiConfig } from '../config/api';

interface FetchOptions {
  requireAuth?: boolean;
  params?: Record<string, any>;
  data?: any;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  retryAttempts?: number;
  retryDelay?: number;
}

// Sleep utility for retry delay
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Exponential backoff calculation
const getRetryDelay = (attempt: number, baseDelay: number) => {
  return baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
};

export const fetchApi = async (
  endpoint: string,
  options: FetchOptions = {}
) => {
  const { clearAuth } = useAuthStore.getState();
  const config = apiConfig.get();
  const {
    requireAuth = true,
    params,
    data,
    method = 'GET',
    retryAttempts = config.retryAttempts,
    retryDelay = config.retryDelay,
  } = options;

  let lastError: Error | null = null;
  let attempt = 1;

  while (attempt <= retryAttempts) {
    try {
      const response = await axiosInstance({
        url: endpoint,
        method,
        params,
        data,
        // Don't modify headers here since axiosInstance already handles auth
        timeout: config.timeout,
      });

      return response.data;
    } catch (error) {
      lastError = error as Error;

      if (axios.isAxiosError(error)) {
        // Handle 401 immediately without retry
        if (error.response?.status === 401 && requireAuth) {
          clearAuth();
          window.location.href = '/sign-in';
          throw new Error('Session expired');
        }

        // Only retry on CORS errors or network errors
        if (isCorsError(error) || !error.response) {
          if (attempt < retryAttempts) {
            const delay = getRetryDelay(attempt, retryDelay);
            if (config.debug) {
              console.warn(
                `Attempt ${attempt}/${retryAttempts} failed for ${endpoint}. Retrying in ${
                  delay / 1000
                }s...`
              );
              console.error('Error details:', error);
            }
            await sleep(delay);
            attempt++;
            continue;
          }
        }
      }
      throw error;
    }
  }

  throw lastError;
};

// Common API methods
export const api = {
  get: <T = any>(
    endpoint: string,
    options: Omit<FetchOptions, 'method' | 'data'> = {}
  ) => fetchApi(endpoint, { ...options, method: 'GET' }) as Promise<T>,

  post: <T = any>(
    endpoint: string,
    data?: any,
    options: Omit<FetchOptions, 'method'> = {}
  ) => fetchApi(endpoint, { ...options, method: 'POST', data }) as Promise<T>,

  put: <T = any>(
    endpoint: string,
    data?: any,
    options: Omit<FetchOptions, 'method'> = {}
  ) => fetchApi(endpoint, { ...options, method: 'PUT', data }) as Promise<T>,

  patch: <T = any>(
    endpoint: string,
    data?: any,
    options: Omit<FetchOptions, 'method'> = {}
  ) => fetchApi(endpoint, { ...options, method: 'PATCH', data }) as Promise<T>,

  delete: <T = any>(
    endpoint: string,
    options: Omit<FetchOptions, 'method' | 'data'> = {}
  ) => fetchApi(endpoint, { ...options, method: 'DELETE' }) as Promise<T>,
};

// Type-safe API response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
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

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

// Helper to check if error is CORS-related
const isCorsError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    // Check for specific CORS error patterns
    if (
      error.message.includes('Network Error') &&
      error.response === undefined
    ) {
      return true;
    }
    // Check for CORS headers missing
    if (
      error.response?.headers?.['access-control-allow-origin'] === undefined
    ) {
      return true;
    }
    // Check for explicit CORS errors
    if (error.message.includes('CORS')) {
      return true;
    }
  }
  return false;
};

// Helper to handle API errors
export const handleApiError = (
  error: unknown,
  attempt?: number,
  maxAttempts?: number
): ApiError => {
  const config = apiConfig.get();

  // Handle CORS errors
  if (isCorsError(error)) {
    const errorInfo = {
      message:
        'Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource. This is likely a CORS configuration issue.',
      status: 0, // CORS errors typically don't have a status code
      type: 'cors' as const,
      attempt,
      maxAttempts,
    };

    if (config.debug) {
      console.error('CORS Error:', errorInfo);
    }

    return errorInfo;
  }

  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    // Handle network errors
    if (!axiosError.response) {
      const errorInfo = {
        message: 'Network error. Please check your connection.',
        status: 0,
        type: 'network' as const,
        attempt,
        maxAttempts,
      };

      if (config.debug) {
        console.error('Network Error:', errorInfo);
      }

      return errorInfo;
    }

    // Handle authentication errors
    if (axiosError.response.status === 401) {
      return {
        message: 'Authentication required. Please log in again.',
        status: 401,
        type: 'auth',
      };
    }

    // Handle validation errors
    if (axiosError.response.status === 422) {
      return {
        message: 'Validation error',
        status: 422,
        errors: axiosError.response.data?.errors,
        type: 'validation',
      };
    }

    // Handle other API errors
    return {
      message: axiosError.response.data?.message || 'An error occurred',
      status: axiosError.response.status,
      errors: axiosError.response.data?.errors,
      type: 'unknown',
    };
  }

  // Handle unknown errors
  return {
    message:
      error instanceof Error ? error.message : 'An unknown error occurred',
    status: 500,
    type: 'unknown',
  };
};
