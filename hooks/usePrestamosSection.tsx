// hooks/usePrestamos.ts
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';
import { useBoardConfig } from '@/store/configValues';
import type {
  LoanFormData,
  CreateLoanPayload,
  Member,
  MemberResponse,
  Prestamo,
  ApiResponse,
} from '@/types';

export const usePrestamos = (juntaId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { monthlyInterestRate } = useBoardConfig();

  const initialFormData: LoanFormData = {
    memberId: '',
    requestDate: new Date().toISOString().split('T')[0],
    amount: 0,
    monthlyInterest: monthlyInterestRate,
    installments: 0,
    paymentType: '',
    reason: '',
    guaranteeType: 'AVAL',
    guaranteeDetail: '',
    formPurchased: false,
  };

  const [formData, setFormData] = useState<LoanFormData>(initialFormData);

  // Queries
  const { data: members = [], isLoading: isLoadingMembers } = useQuery<
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

  const { data: prestamos = [], isLoading: isLoadingPrestamos } = useQuery<
    Prestamo[]
  >({
    queryKey: ['prestamos', juntaId],
    queryFn: async () => {
      const response = await api.get<Prestamo[]>(`prestamos/junta/${juntaId}`);
      return response;
    },
  });

  // Mutations
  const createLoanMutation = useMutation({
    mutationFn: async (data: LoanFormData) => {
      const payload: CreateLoanPayload = {
        juntaId,
        memberId: data.memberId,
        request_date: data.requestDate,
        amount: data.amount.toString(),
        monthly_interest: data.monthlyInterest.toString(),
        number_of_installments: data.installments,
        loan_type: data.paymentType,
        reason: data.reason,
        guarantee_type: data.guaranteeType,
        guarantee_detail: data.guaranteeDetail,
        form_purchased: data.formPurchased,
        payment_type: 'MENSUAL',
      };

      return api.post<ApiResponse<Prestamo>>('prestamos', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestamos', juntaId] });
      queryClient.invalidateQueries({ queryKey: ['junta', juntaId] });
      queryClient.invalidateQueries({ queryKey: ['acciones', juntaId] });
      queryClient.invalidateQueries({
        queryKey: ['payment-history', juntaId],
      });
      toast({
        title: 'Éxito',
        description: 'Préstamo registrado correctamente',
      });
      setFormData(initialFormData);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Error al registrar préstamo',
        variant: 'destructive',
      });
    },
  });

  const deleteLoanMutation = useMutation({
    mutationFn: (id: string) => api.delete(`prestamos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestamos', juntaId] });
      queryClient.invalidateQueries({ queryKey: ['junta', juntaId] });
      toast({
        title: 'Éxito',
        description: 'Préstamo eliminado correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Error al eliminar préstamo',
        variant: 'destructive',
      });
    },
  });

  // Form handlers
  const updateFormData = (updates: Partial<LoanFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    updateFormData({
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createLoanMutation.mutateAsync(formData);
  };

  const handleDeleteLoan = (id: string) => {
    deleteLoanMutation.mutate(id);
  };

  return {
    formData,
    members,
    prestamos,
    isLoading:
      isLoadingMembers ||
      isLoadingPrestamos ||
      createLoanMutation.isPending ||
      deleteLoanMutation.isPending,
    updateFormData,
    handleInputChange,
    handleSubmit,
    handleDeleteLoan,
  };
};
