import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';
import type {
  // Payment,
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
  installment_number: z.number().default(1),
  different_payment: z.boolean().default(false),
});

const QUERY_KEYS = {
  loans: (juntaId: string) => ['loans', juntaId],
  payments: (juntaId: string) => ['payment-history', juntaId],
  loanStatus: (loanId: string) => ['loan-status', loanId],
  junta: (juntaId: string) => ['junta', juntaId],
} as const;

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
      installment_number: 1,
      different_payment: false,
    },
  });

  useEffect(() => {
    const fetchUpdates = async () => {
      await api.get(`/junta/${juntaId}/updates`);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.loans(juntaId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.payments(juntaId),
      });
    };

    const intervalId = setInterval(fetchUpdates, 30000); // Fetch updates every 30 seconds

    return () => clearInterval(intervalId);
  }, [juntaId, queryClient]);

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
  queryKey: QUERY_KEYS.loans(juntaId),
  queryFn: async () => {
    const response = await api.get(`/prestamos/junta/${juntaId}`);
    return response;
  },
  staleTime: 0,
  refetchInterval: 30000, // Refetch every 30 seconds
});

const { data: paymentHistory = [], isLoading: isLoadingHistory, refetch: refetchLoans } = useQuery<
  PaymentHistory[]
>({
  queryKey: QUERY_KEYS.payments(juntaId),
  queryFn: async () => {
    const response = await api.get(`junta-payments/${juntaId}/history`);
    console.log("response: ", response);
    return response;
  },
  staleTime: 0,
  refetchInterval: 30000,
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
      console.log(" values.interest_payment: ",  values.interest_payment);
      console.log("values.capital_payment: ", values.capital_payment);
      return api.post(`prestamos/${selectedPrestamoId}/pagos`, {
        amount,
        principal_paid: values.capital_payment,
        interest_paid: values.interest_payment,
        installment_number: values.installment_number,
        date: values.date,
        is_different_payment: values.different_payment,
      });
    },
    onSuccess: () => {
      // Invalidate all related queries atomically
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.payments(juntaId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.loans(juntaId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.loanStatus(selectedPrestamoId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.junta(juntaId),
      });

      toast({
        title: 'Pago registrado',
        description: 'El pago se ha registrado exitosamente.',
      });
      form.reset();
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description:
          (error as Error)?.message || 'Error al registrar el pago',
        variant: 'destructive',
      });
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (id: string) => api.delete(`prestamos/pagos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-history', juntaId] });
      // queryClient.invalidateQueries({
      //   queryKey: ['loan-status', selectedPrestamoId],
      // });
            queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.loanStatus(selectedPrestamoId),
            });
      refetchLoans();
      queryClient.invalidateQueries({ queryKey: ['junta', juntaId] });
      toast({
        title: 'Pago eliminado',
        description: 'El pago se ha eliminado exitosamente.',
      });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: (error as Error)?.message || 'Error al eliminar el pago',
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
    refetchLoans:refetchLoans,
    refetchLoanStatus,
    paymentHistory,
    loanStatusUpdatePrincipal,
    isLoading,
    handleFormChange,
    handleDeletePago,
    onSubmit,
  };
};
