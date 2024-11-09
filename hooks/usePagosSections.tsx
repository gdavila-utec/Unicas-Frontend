import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';
import type {
  Payment,
  PaymentHistory,
  LoanStatus,
  Prestamo,
  MemberResponse as Member,
} from '@/types';

const formSchema = z.object({
  date: z.date(),
  member: z.string().min(1, { message: 'Por favor seleccione un socio' }),
  loan: z.string().min(1, { message: 'Por favor seleccione un préstamo' }),
  capital_payment: z.number().min(0, { message: 'Ingrese un monto válido' }),
  interest_payment: z.number().min(0, { message: 'Ingrese un monto válido' }),
  is_late_payment: z.boolean().default(false),
  different_payment: z.boolean().default(false),
  checkValue: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

export const usePagos = (juntaId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedPrestamoId, setSelectedPrestamoId] = useState<string>('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      member: '',
      loan: '',
      capital_payment: 0,
      interest_payment: 0,
      is_late_payment: false,
      different_payment: false,
      checkValue: false,
    },
  });

  // Queries
  const { data: members = [], isLoading: isLoadingMembers } = useQuery<
    Member[]
  >({
    queryKey: ['members', juntaId],
    queryFn: async () => {
      const response = await api.get(`/members/junta/${juntaId}`);
      return response;
    },
  });

  const { data: loans = [], isLoading: isLoadingLoans } = useQuery<Prestamo[]>({
    queryKey: ['loans', juntaId],
    queryFn: async () => {
      const response = await api.get(`/prestamos/junta/${juntaId}`);
      return response;
    },
  });

  const { data: paymentHistory = [], isLoading: isLoadingHistory } = useQuery<
    PaymentHistory[]
  >({
    queryKey: ['payment-history', juntaId],
    queryFn: async () => {
      const response = await api.get(`junta-payments/${juntaId}/history`);
      return response;
    },
  });

  const { data: loanStatus, isLoading: isLoadingLoanStatus } =
    useQuery<LoanStatus>({
      queryKey: ['loan-status', selectedPrestamoId],
      queryFn: async () => {
        const response = await api.get(
          `prestamos/${selectedPrestamoId}/remaining-payments`
        );
        return response;
      },
      enabled: !!selectedPrestamoId,
    });

  // Mutations
  const createPaymentMutation = useMutation({
    mutationFn: async (values: FormData) => {
      const amount = values.capital_payment + values.interest_payment;
      return api.post(`prestamos/${selectedPrestamoId}/pagos`, {
        amount: amount,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-history', juntaId] });
      queryClient.invalidateQueries({ queryKey: ['junta', juntaId] });
      queryClient.invalidateQueries({
        queryKey: ['loan-status', selectedPrestamoId],
      });
      toast({
        title: 'Pago registrado',
        description: 'El pago se ha registrado exitosamente.',
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Error al registrar el pago',
        variant: 'destructive',
      });
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (id: string) => api.delete(`prestamos/pagos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-history', juntaId] });
      queryClient.invalidateQueries({
        queryKey: ['loan-status', selectedPrestamoId],
      });
      queryClient.invalidateQueries({
        queryKey: ['junta', juntaId],
      });
      toast({
        title: 'Pago eliminado',
        description: 'El pago se ha eliminado exitosamente.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Error al eliminar el pago',
        variant: 'destructive',
      });
    },
  });

  // Handlers
  const handleFormChange = () => {
    const memberId = form.getValues('member');
    const loanId = form.getValues('loan');

    if (loanId) {
      setSelectedPrestamoId(loanId);
    }
  };

  const handleCuotaCheck = (installment: Payment) => {
    if (installment) {
      form.setValue(
        'capital_payment',
        parseFloat(installment.principal.toFixed(2))
      );
      form.setValue(
        'interest_payment',
        parseFloat(installment.interest.toFixed(2))
      );

      if (
        loanStatus?.remainingPayments &&
        installment.id !== loanStatus.remainingPayments[0].id
      ) {
        toast({
          title: 'Pago cuota',
          description:
            'Solo puede seleccionar la cuota que le corresponde pagar antes de poder pagar otras cuotas',
        });
      }
    }
  };

  const onSubmit = async (values: FormData) => {
    await createPaymentMutation.mutateAsync(values);
  };

  const handleDeletePago = async (id: string) => {
    await deletePaymentMutation.mutateAsync(id);
  };

  const filteredLoans = form.watch('member')
    ? loans.filter((loan) => loan.memberId === form.watch('member'))
    : loans;

  return {
    form,
    members,
    loans: filteredLoans,
    paymentHistory,
    loanStatus,
    isLoading:
      isLoadingMembers ||
      isLoadingLoans ||
      isLoadingHistory ||
      isLoadingLoanStatus ||
      createPaymentMutation.isPending ||
      deletePaymentMutation.isPending,
    handleFormChange,
    handleCuotaCheck,
    handleDeletePago,
    onSubmit,
  };
};
