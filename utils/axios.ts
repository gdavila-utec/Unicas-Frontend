import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://unicas-nest-backend-production.up.railway.app';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Handle 401 errors
      if (error.response.status === 401) {
        Cookies.remove('token');
        window.location.href = '/sign-in';
      }

      // Extract error message
      const message = error.response.data?.message || 'An error occurred';
      return Promise.reject(new Error(message));
    }

    // Handle network errors
    if (error.request) {
      console.error('Network Error:', error.request);
      return Promise.reject(
        new Error('Network error. Please check your connection.')
      );
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
