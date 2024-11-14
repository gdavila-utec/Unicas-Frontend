// hooks/useResumen.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';
import type { Member, Prestamo, Junta } from '@/types';

export const useResumen = (juntaId: string) => {
  console.log('juntaId: ', juntaId);
  // Query for junta details
  const { data: junta, isLoading: isLoadingJunta } = useQuery<Junta>({
    queryKey: ['junta', juntaId],
    queryFn: async () => {
      const response = await api.get(`juntas/${juntaId}`);
      return response;
    },
  });

  // Query for members
  const { data: members = [], isLoading: isLoadingMembers } = useQuery<
    Member[]
  >({
    queryKey: ['members', juntaId],
    queryFn: async () => {
      const response = await api.get(`members/junta/${juntaId}`);
      return response;
    },
  });

  // Query for active loans
  const { data: prestamos = [], isLoading: isLoadingPrestamos } = useQuery<
    Prestamo[]
  >({
    queryKey: ['prestamos', juntaId],
    queryFn: async () => {
      const response = await api.get(`prestamos/junta/${juntaId}`);
      return response;
    },
  });

  // Calculate junta summary
  const calculateJuntaSummary = () => {
    const capitalTotal = junta?.base_capital || 0;
    const capitalReserva = junta?.available_capital || 0;
    const fondoSocial = junta?.current_capital || 0;

    return {
      capital_total: capitalTotal,
      reserva_capital: capitalReserva,
      fondo_social: fondoSocial,
    };
  };

  const summary = calculateJuntaSummary();
  const activePrestamos = prestamos.filter((p) =>
    ['PARTIAL', 'PENDING'].includes(p.status)
  );

  const isLoading = isLoadingJunta || isLoadingMembers || isLoadingPrestamos;

  return {
    junta,
    members,
    activePrestamos,
    summary,
    isLoading,
  };
};
