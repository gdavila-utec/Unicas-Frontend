// hooks/useMemberSection.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';
import type { Member, Accion, Prestamo, Pago } from '@/types';

interface MemberDetail extends Member {
  cargo: string;
  fecha_ingreso: string;
  actividad_productiva: string;
}

interface MemberSummary {
  acciones: {
    count: number;
    valor: number;
  };
  prestamos_activos: {
    monto_solicitado: number;
    monto_adeudo: number;
    cuotas_pendientes: number;
    monto_proxima_cuota: number;
  };
}

export const useMemberSection = (memberId: string, juntaId: string) => {
  // Query for member details
  const { data: memberDetail, isLoading: isLoadingMember } =
    useQuery<MemberDetail>({
      queryKey: ['member', memberId],
      queryFn: async () => {
        console.log('memberId: ', memberId);
        const response = await api.get(`members/${memberId}`);
        return response;
      },
    });

  // Query for member's shares
  const { data: acciones = [], isLoading: isLoadingAcciones } = useQuery<
    Accion[]
  >({
    queryKey: ['acciones', memberId],
    queryFn: async () => {
      const response = await api.get(`acciones/member/${memberId}`);
      return response;
    },
  });

  // Query for member's active loans
  const { data: prestamos = [], isLoading: isLoadingPrestamos } = useQuery<
    Prestamo[]
  >({
    queryKey: ['prestamos', memberId],
    queryFn: async () => {
      const response = await api.get(`prestamos/member/${memberId}`);
      return response;
    },
  });

  // Query for all members in junta
  const { data: members = [], isLoading: isLoadingMembers } = useQuery<
    Member[]
  >({
    queryKey: ['members', juntaId],
    queryFn: async () => {
      const response = await api.get(`members/junta/${juntaId}`);
      return response;
    },
  });

  // Calculate member summary
  const calculateMemberSummary = (): MemberSummary => {
    const accionesCount = acciones.reduce(
      (sum, accion) => sum + accion.amount,
      0
    );
    const accionesValor = acciones.reduce(
      (sum, accion) => sum + accion.amount * accion.shareValue,
      0
    );

    const activePrestamos = prestamos.filter((prestamo) =>
      ['PARTIAL', 'PENDING'].includes(prestamo.status)
    );

    const montoSolicitado = activePrestamos.reduce(
      (sum, prestamo) => sum + Number(prestamo.amount),
      0
    );

    const montoAdeudo = activePrestamos.reduce((sum, prestamo) => {
      // Get the remaining amount from the payment schedule
      const remainingAmount = prestamo.paymentSchedule
        .filter((payment) => !(payment.status === 'PAID'))
        .reduce((acc, payment) => acc + payment.expected_amount, 0);
      return sum + remainingAmount;
    }, 0);

    const cuotasPendientes = activePrestamos.reduce(
      (sum, prestamo) =>
        sum +
        prestamo.paymentSchedule.filter((p) => !(p.status === 'PAID')).length,
      0
    );

    const proximaCuota = activePrestamos.reduce((sum, prestamo) => {
      const nextPayment = prestamo.paymentSchedule.find(
        (p) => !(p.status === 'PAID')
      );
      return sum + (nextPayment?.expected_amount || 0);
    }, 0);

    return {
      acciones: {
        count: accionesCount,
        valor: accionesValor,
      },
      prestamos_activos: {
        monto_solicitado: montoSolicitado,
        monto_adeudo: montoAdeudo,
        cuotas_pendientes: cuotasPendientes,
        monto_proxima_cuota: proximaCuota,
      },
    };
  };

  const summary = calculateMemberSummary();

  const isLoading =
    isLoadingMember ||
    isLoadingAcciones ||
    isLoadingPrestamos ||
    isLoadingMembers;

  return {
    memberDetail,
    summary,
    members,
    prestamos,
    acciones,
    isLoading,
  };
};
