import useAuthStore from '../store/useAuthStore';
import { useMutation } from 'react-query';
import axios from 'axios';

interface UpdateUserData {
  name?: string;
  phone?: string;
}

interface ApiResponse<T> {
  data: T;
}

interface User {
  id: string;
  name: string;
  phone: string;
}

export function useUpdateUser(userId: string) {
  return useApiMutation<User, UpdateUserData>(`/api/users/${userId}`, {
    method: 'PATCH',
    onSuccess: (data: User) => {
      // Update auth store if current user
      const authStore = useAuthStore.getState();
      if (authStore.user?.id === userId) {
        authStore.setAuth({
          token: authStore.token || '',
          role: authStore.role || '',
          user: data,
        });
      }
    },
  });
}

function useApiMutation<T, U>(
  url: string,
  options: { method: string; onSuccess: (data: T) => void }
) {
  return useMutation<T, unknown, U>(
    async (data: U) => {
      const response = await axios<ApiResponse<T>>({
        url,
        method: options.method,
        data,
      });
      return response.data.data; // Extract the nested data
    },
    {
      onSuccess: (data) => {
        options.onSuccess(data);
      },
    }
  );
}
