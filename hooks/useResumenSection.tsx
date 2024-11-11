import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { api } from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';
import type {
  Junta,
  MemberResponse as Member,
  Prestamo,
  Accion,
  PaymentHistory,
  ApiResponse,
  CapitalAmount,
} from '@/types';

interface UseResumenResult {
  members: Member[];
  loans: Prestamo[];
  acciones: Accion[];
  payments: PaymentHistory[];
  capital: CapitalAmount | null;
  isLoading: boolean;
  error: Error | null;
}

export const useResumen = (juntaId: string): UseResumenResult => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Members Query
  const {
    data: members = [],
    isLoading: isLoadingMembers,
    error: membersError,
  } = useQuery<Member[]>({
    queryKey: ['members', juntaId],
    queryFn: async () => {
      const response = await api.get<Member[]>(`members/junta/${juntaId}`);
      return response.filter((member) => member.member_role === 'socio');
    },
    enabled: isAuthenticated,
  });

  // Loans Query
  const {
    data: loans = [],
    isLoading: isLoadingLoans,
    error: loansError,
  } = useQuery<Prestamo[]>({
    queryKey: ['loans', juntaId],
    queryFn: async () => {
      const response = await api.get<Prestamo[]>(`prestamos/junta/${juntaId}`);
      return response;
    },
    enabled: isAuthenticated,
  });

  // Acciones Query
  const {
    data: acciones = [],
    isLoading: isLoadingAcciones,
    error: accionesError,
  } = useQuery<Accion[]>({
    queryKey: ['acciones', juntaId],
    queryFn: async () => {
      const response = await api.get<Accion[]>(`acciones/junta/${juntaId}`);
      return response;
    },
    enabled: isAuthenticated,
  });

  // Payments Query
  const {
    data: payments = [],
    isLoading: isLoadingPayments,
    error: paymentsError,
  } = useQuery<PaymentHistory[]>({
    queryKey: ['payments', juntaId],
    queryFn: async () => {
      const response = await api.get<PaymentHistory[]>(
        `junta-payments/${juntaId}/history`
      );
      return response;
    },
    enabled: isAuthenticated,
  });

  // Capital Query
  const {
    data: capital = null,
    isLoading: isLoadingCapital,
    error: capitalError,
  } = useQuery<CapitalAmount | null>({
    queryKey: ['capital', juntaId],
    queryFn: async () => {
      const response = await api.get<Junta>(`juntas/${juntaId}`);
      return {
        total: response.current_capital,
        base: response.base_capital,
        available: response.available_capital,
      };
    },
    enabled: isAuthenticated,
  });

  // Handle authentication error
  useQuery({
    queryKey: ['auth-check'],
    queryFn: async () => {
      if (!isAuthenticated) {
        router.push('/sign-in');
      }
      return null;
    },
    enabled: !isAuthenticated,
  });

  const isLoading =
    isLoadingMembers ||
    isLoadingLoans ||
    isLoadingAcciones ||
    isLoadingPayments ||
    isLoadingCapital;

  const error =
    membersError ||
    loansError ||
    accionesError ||
    paymentsError ||
    capitalError;

  return {
    members,
    loans,
    acciones,
    payments,
    capital,
    isLoading,
    error: error as Error | null,
  };
};
