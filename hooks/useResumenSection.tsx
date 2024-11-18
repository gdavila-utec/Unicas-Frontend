// hooks/useResumen.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';
import type { Member, Prestamo, Junta, MemberResponse, Accion } from '@/types';
import useSharesByMember from './useSharesByMember';


export const useResumen = (juntaId: string) => {
  // Query for junta details
  const { data: junta, isLoading: isLoadingJunta } = useQuery<Junta>({
    queryKey: ['junta', juntaId],
    queryFn: async () => {
      const response = await api.get(`juntas/${juntaId}`);
      return response;
    },
  });

    const {
      data: acciones = [],
      isLoading: isLoadingAcciones,
      error: accionesError,
      refetch: refetchAcciones,
    } = useQuery({
      queryKey: ['acciones', juntaId],
      queryFn: async () => {
        const response = await api.get<Accion[]>(`acciones/junta/${juntaId}`);
        return Array.isArray(response) ? response : [];
      },
      staleTime: 0,
    });
    
    const { sharesByMember, isLoading: isLoadingAccionesByMember, error, totalShares, totalValue } =
      useSharesByMember(acciones);
 

  // Query for members
  const { data: members = [], isLoading: isLoadingMembers } = useQuery<
    Member[]
  >({
    queryKey: ['members', juntaId],
    queryFn: async () => {
      const response = await api.get(`members/junta/${juntaId}`);
      const filteredMembers = response.filter(
        (m: MemberResponse) => m.role !== 'ADMIN'
      );
      return filteredMembers;
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

  const isLoading =
    isLoadingJunta ||
    isLoadingMembers ||
    isLoadingPrestamos ||
    isLoadingAcciones ||
    isLoadingAccionesByMember;

  return {
    sharesByMember,
    junta,
    members,
    activePrestamos,
    summary,
    isLoading,
  };
};
