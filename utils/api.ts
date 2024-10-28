// utils/api.ts
import useAuthStore from '@/store/useAuthStore';

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchApi = async (
  endpoint: string,
  options: FetchOptions = {}
) => {
  const { token, clearAuth } = useAuthStore.getState();
  const { requireAuth = true, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(requireAuth && token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 && requireAuth) {
        clearAuth();
        window.location.href = '/sign-in';
        throw new Error('Session expired');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};
