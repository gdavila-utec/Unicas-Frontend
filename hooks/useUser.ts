import { useState, useEffect } from 'react';
import axios from 'axios';

// hooks/useUser.ts
interface User {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
}

export function useUser(userId: string) {
  return useApiQuery<User>(`/api/users/${userId}`, ['user', userId], {
    requireAuth: true,
  });
}
function useApiQuery<T>(
  url: string,
  queryKey: string[],
  options: { requireAuth: boolean }
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(url, {
          headers: options.requireAuth
            ? { Authorization: 'Bearer YOUR_TOKEN_HERE' }
            : {},
        });
        setData(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, queryKey, options.requireAuth]);

  return { data, error, loading };
}
