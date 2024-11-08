import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';
import { Junta, Member, Prestamo, Pago } from '../types';

const PREFETCH_STALE_TIME = 1000 * 60 * 5; // 5 minutes

// Track in-flight requests
const activeRequests = new Map<string, Promise<unknown>>();

// Helper to safely extract data from response
const extractData = <T>(response: unknown): T => {
  if (!response || typeof response !== 'object') {
    console.warn('Invalid response:', response);
    throw new Error('Invalid response');
  }

  const axiosResponse = response as { data: T };
  console.log('Response data:', axiosResponse.data);

  // Return the data directly since the API returns it in the correct format
  return axiosResponse.data;
};

// Helper to validate junta data
const validateJunta = (data: unknown): Junta => {
  console.log('Validating junta data:', data);
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid junta data: not an object');
  }

  const juntaData = data as Record<string, unknown>;
  if (!('id' in juntaData)) {
    console.warn('Invalid junta structure:', juntaData);
    throw new Error('Invalid junta data: missing id');
  }

  return data as Junta;
};

// Helper to validate members data
const validateMembers = (data: unknown): Member[] => {
  console.log('Validating members data:', data);
  if (!Array.isArray(data)) {
    console.warn('Invalid members data: not an array:', data);
    return []; // Return empty array instead of throwing
  }

  const validMembers = data.filter((member): member is Member => {
    if (!member || typeof member !== 'object') {
      console.warn('Invalid member:', member);
      return false;
    }
    return 'id' in member;
  });

  console.log('Valid members:', validMembers);
  return validMembers;
};

export function usePrefetch() {
  const queryClient = useQueryClient();

  const prefetchWithDeduplication = useCallback(
    async <T>(
      queryKey: string[],
      fetchFn: () => Promise<T>
    ): Promise<T | undefined> => {
      const requestKey = queryKey.join('-');

      // Check if request is already in flight
      if (activeRequests.has(requestKey)) {
        return activeRequests.get(requestKey) as Promise<T>;
      }

      // Check if we already have fresh data
      const existingData = queryClient.getQueryData<T>(queryKey);
      if (existingData) {
        return existingData;
      }

      // Create new request with proper data extraction
      const request = (async () => {
        try {
          const result = await queryClient.fetchQuery({
            queryKey,
            queryFn: fetchFn,
            staleTime: PREFETCH_STALE_TIME,
          });

          return result;
        } catch (error) {
          console.error(`Prefetch error for ${requestKey}:`, error);
          throw error;
        }
      })();

      // Track the request
      activeRequests.set(requestKey, request);

      try {
        return await request;
      } finally {
        // Clean up after request completes
        activeRequests.delete(requestKey);
      }
    },
    [queryClient]
  );

  const prefetchJunta = useCallback(
    async (juntaId: string) => {
      return prefetchWithDeduplication(['junta', juntaId], async () => {
        try {
          const response = await api.get<Junta>(`juntas/${juntaId}`);
          console.log('Raw junta response:', response);
          const data = extractData<Junta>(response);
          return validateJunta(data);
        } catch (error) {
          console.error('Error prefetching junta:', error);
          throw error;
        }
      });
    },
    [prefetchWithDeduplication]
  );

  const prefetchMembers = useCallback(
    async (juntaId: string) => {
      return prefetchWithDeduplication(['members', juntaId], async () => {
        try {
          const response = await api.get<Member[]>(`members/junta/${juntaId}`);
          console.log('Raw members response:', response);
          const data = extractData<Member[]>(response);
          return validateMembers(data);
        } catch (error) {
          console.error('Error prefetching members:', error);
          throw error;
        }
      });
    },
    [prefetchWithDeduplication]
  );

  const prefetchMember = useCallback(
    async (memberId: string) => {
      return prefetchWithDeduplication(['member', memberId], async () => {
        try {
          const response = await api.get<Member>(`members/${memberId}`);
          console.log('Raw member response:', response);
          const data = extractData<Member>(response);
          return validateJunta(data);
        } catch (error) {
          console.error('Error prefetching member:', error);
          throw error;
        }
      });
    },
    [prefetchWithDeduplication]
  );

  const prefetchLoans = useCallback(
    async (juntaId: string) => {
      return prefetchWithDeduplication(['loans', juntaId], async () => {
        try {
          const response = await api.get<Prestamo[]>(
            `prestamos/junta/${juntaId}`
          );
          console.log('Raw loans response:', response);
          return extractData<Prestamo[]>(response);
        } catch (error) {
          console.error('Error prefetching loans:', error);
          throw error;
        }
      });
    },
    [prefetchWithDeduplication]
  );

  const prefetchPayments = useCallback(
    async (juntaId: string) => {
      return prefetchWithDeduplication(['payments', juntaId], async () => {
        try {
          const response = await api.get<Pago[]>(
            `prestamos/junta/${juntaId}/pagos`
          );
          console.log('Raw payments response:', response);
          return extractData<Pago[]>(response);
        } catch (error) {
          console.error('Error prefetching payments:', error);
          throw error;
        }
      });
    },
    [prefetchWithDeduplication]
  );

  return {
    prefetchJunta,
    prefetchMembers,
    prefetchMember,
    prefetchLoans,
    prefetchPayments,
  };
}
