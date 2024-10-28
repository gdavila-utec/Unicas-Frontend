// hooks/useApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/utils/api';
import useAuthStore from '@/store/useAuthStore';

// Type for API responses
interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// Helper to ensure endpoint starts with /api
const normalizeEndpoint = (endpoint: string): string => {
  return endpoint.startsWith('/api/') ? endpoint : `/api${endpoint}`;
};

// Generic GET hook
export function useApiQuery<T>(
  endpoint: string,
  queryKey: string[],
  options: {
    enabled?: boolean;
    requireAuth?: boolean;
    refetchInterval?: number;
  } = {}
) {
  const { isAuthenticated } = useAuthStore();
  const { enabled = true, requireAuth = true, ...queryOptions } = options;

  return useQuery({
    queryKey: queryKey,
    queryFn: () => fetchApi(normalizeEndpoint(endpoint), { requireAuth }),
    enabled: (!requireAuth || isAuthenticated) && enabled,
    ...queryOptions,
  });
}

// Generic mutation hook
export function useApiMutation<TData, TVariables>(
  endpoint: string,
  options: {
    onSuccess?: (data: ApiResponse<TData>) => void;
    requireAuth?: boolean;
    method?: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  } = {}
) {
  const queryClient = useQueryClient();
  const { requireAuth = true, method = 'POST', onSuccess } = options;

  return useMutation({
    mutationFn: (variables: TVariables) =>
      fetchApi(normalizeEndpoint(endpoint), {
        method,
        data: variables,
        requireAuth,
      }),
    onSuccess: (data) => {
      onSuccess?.(data);
      // Optionally invalidate queries
      queryClient.invalidateQueries();
    },
  });
}
