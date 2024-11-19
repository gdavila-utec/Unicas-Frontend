// hooks/useSocioSection.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';
import type { Accion, MemberResponse, Prestamo } from '@/types';

interface SocioSummary {
  acciones: {
    count: number;
    valor: number;
  };
  prestamos: LoanSummary;
}

interface RemainingPayment {
  id: string;
  due_date: string;
  expected_amount: number;
  principal: number;
  interest: number;
  installment_number: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID';
  createdAt: string;
  updatedAt: string;
  prestamoId: string;
}

interface LoanPaymentStatus {
  totalPaid: number;
  remainingAmount: number;
  remainingPayments: RemainingPayment[];
  nextPaymentDue: RemainingPayment;
  nextPaymentDate: string;
  isOverdue: boolean;
}

interface LoanSummary {
  prestamos: {
    monto_solicitado: number;
    monto_adeudado: number;
    cuotas_pendientes: number;
    proximo_pago: number;
  };
}


export const useSocioSection = (juntaId: string, memberId: string) => {
  // Get member's information
  const { data: members, isLoading: loadingMembers } = useQuery<
    MemberResponse[]
  >({
    queryKey: ['members', juntaId],
    queryFn: async () => {
      const response = await api.get<MemberResponse[]>(
        `members/junta/${juntaId}`
      );
      return response;
    },
  });

  // Get member's shares
  const { data: acciones, isLoading: loadingAcciones } = useQuery<Accion[]>({
    queryKey: ['acciones', juntaId],
    queryFn: async () => {
      const response = await api.get<Accion[]>(`acciones/junta/${juntaId}`);

      return response;
    },
  });
  
  // Get member's loans
  const { data: prestamos, isLoading: loadingPrestamos } = useQuery<Prestamo[]>(
    {
      queryKey: ['prestamos', juntaId],
      queryFn: async () => {
        const response = await api.get<Prestamo[]>(
          `prestamos/junta/${juntaId}`
        );

        return response;
      },
    }
  );

  // Get remaining payments for each loan
 const { data: remainingPayments, isLoading: loadingPayments } = useQuery<
   LoanPaymentStatus[]
 >({
   queryKey: ['remainingPayments', memberId, prestamos?.length],
   queryFn: async () => {
     const memberLoans =
       prestamos?.filter((prestamo) => prestamo.memberId === memberId) || [];

     const payments = await Promise.all(
       memberLoans.map(async (loan) => {
         const response = await api.get<LoanPaymentStatus>(
           `prestamos/${loan.id}/remaining-payments`
         );
         return response; // This directly returns the LoanPaymentStatus
       })
     );

     return payments;
   },
   enabled: !!prestamos && !!memberId,
 });

 // Calculate loans summary with null checks
 const calculateLoansSummary = (): LoanSummary => {
   if (!remainingPayments) {
     return {
       prestamos: {
         monto_solicitado: 0,
         monto_adeudado: 0,
         cuotas_pendientes: 0,
         proximo_pago: 0,
       },
     };
   }

   const montoAdeudado = remainingPayments.reduce(
     (sum, loanStatus) => sum + (loanStatus?.remainingAmount || 0),
     0
   );

   const cuotasPendientes = remainingPayments.reduce(
     (sum, loanStatus) => sum + (loanStatus?.remainingPayments?.length || 0),
     0
   );

   const proximoPago = remainingPayments.reduce(
     (sum, loanStatus) =>
       sum + (loanStatus?.nextPaymentDue?.expected_amount || 0),
     0
   );

   const montoSolicitado = remainingPayments.reduce(
     (sum, loanStatus) =>
       sum +
       ((loanStatus?.totalPaid || 0) + (loanStatus?.remainingAmount || 0)),
     0
   );

   return {
     prestamos: {
       monto_solicitado: montoSolicitado,
       monto_adeudado: montoAdeudado,
       cuotas_pendientes: cuotasPendientes,
       proximo_pago: proximoPago,
     },
   };
 };

  // Calculate summary data
  const calculateSummary = (): SocioSummary => {
    const memberAcciones =
      acciones?.filter((accion) => accion.memberId === memberId) || [];
    const memberPrestamos =
      prestamos?.filter((prestamo) => prestamo.memberId === memberId) || [];

    // Calculate shares summary
    const accionesCount = memberAcciones.reduce(
      (sum, accion) => sum + accion.amount,
      0
    );
    const accionesValor = memberAcciones.reduce(
      (sum, accion) => sum + accion.amount * accion.shareValue,
      0
    );

    // Calculate active loans summary
    const activePrestamos = memberPrestamos.filter((prestamo) =>
      ['PENDING', 'PARTIAL'].includes(prestamo.status)
    );

    // const montoSolicitado = activePrestamos.reduce(
    //   (sum, prestamo) => sum + Number(prestamo.amount),
    //   0
    // );

    // const montoAdeudado =
    //   remainingPayments?.reduce((sum, loanPayments) => {
    //     const totalRemaining = loanPayments.payments.reduce(
    //       (acc, payment) => acc + payment.expected_amount,
    //       0
    //     );
    //     return sum + totalRemaining;
    //   }, 0) || 0;

    // const cuotasPendientes =
    //   remainingPayments?.reduce(
    //     (sum, loanPayments) => sum + loanPayments.payments.length,
    //     0
    //   ) || 0;

    // const proximoPago =
    //   remainingPayments?.reduce((sum, loanPayments) => {
    //     const nextPayment = loanPayments.payments[0];
    //     return sum + (nextPayment?.expected_amount || 0);
    //   }, 0) || 0;

    return {
      acciones: {
        count: accionesCount,
        valor: accionesValor,
      },
      prestamos: calculateLoansSummary()
    };
  };

  // Get member details
  const memberDetail = members?.find((member) => member.id === memberId);

  const summary = calculateSummary();

  const isLoading =
    loadingMembers || loadingAcciones || loadingPrestamos || loadingPayments;

  return {
    memberDetail,
    summary,
    acciones: acciones?.filter((accion) => accion.memberId === memberId) || [],
    prestamos:
      prestamos?.filter((prestamo) => prestamo.id === memberId) || [],
    remainingPayments,
    isLoading,
    error: null,
  };
};
