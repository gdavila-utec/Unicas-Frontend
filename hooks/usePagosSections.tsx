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
  different_payment: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

export const usePagos = (juntaId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedPrestamoId, setSelectedPrestamoId] = useState<string>('');
  console.log("selectedPrestamoId: ", selectedPrestamoId);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      member: '',
      loan: '',
      capital_payment: 0,
      interest_payment: 0,
      different_payment: false,
    },
  });

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
    staleTime: 0,
  });

  const { data: paymentHistory = [], isLoading: isLoadingHistory } = useQuery<
    PaymentHistory[]
  >({
    queryKey: ['payment-history', juntaId],
    queryFn: async () => {
      const response = await api.get(`junta-payments/${juntaId}/history`);
      return response;
    },
    staleTime: 0,
  });

  const {
    data: loanStatusUpdatePrincipal,
    isLoading: isLoadingLoanStatus,
    refetch: refetchLoanStatus,
  } = useQuery<LoanStatus>({
    queryKey: ['loan-status', selectedPrestamoId],
    queryFn: async () => {
      const response = await api.get(
        `prestamos/${selectedPrestamoId}/remaining-payments`
      );
      return response;
    },
    enabled: !!selectedPrestamoId,
    staleTime: 0,
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (values: FormData) => {
      const amount = values.capital_payment + values.interest_payment;
      return api.post(`prestamos/${selectedPrestamoId}/pagos`, {
        amount: amount,
        principal_paid: values.capital_payment,
        interest_paid: values.interest_payment,
        date: values.date,
        is_different_payment: values.different_payment,
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
      queryClient.invalidateQueries({ queryKey: ['junta', juntaId] });
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

  const handleFormChange = () => {
    const loanId = form.getValues('loan');
    if (loanId) {
      setSelectedPrestamoId(loanId);
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

  const isLoading =
    isLoadingMembers ||
    isLoadingLoans ||
    isLoadingHistory ||
    isLoadingLoanStatus ||
    createPaymentMutation.isPending ||
    deletePaymentMutation.isPending;

  return {
    form,
    members,
    loans: filteredLoans,
    refetchLoanStatus,
    paymentHistory,
    loanStatusUpdatePrincipal,
    isLoading,
    handleFormChange,
    handleDeletePago,
    onSubmit,
  };
};
