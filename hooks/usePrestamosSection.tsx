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
  MemberInfo,
  Prestamo,
  Accion,
} from '@/types';

export const usePrestamos = (juntaId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { monthlyInterestRate, shareValue } = useBoardConfig();

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
    formCost: 0,
  };

  const [formData, setFormData] = useState<LoanFormData>(initialFormData);

  // Query for members
  const { data: members = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ['members', juntaId],
    queryFn: async () => {
      const response = await api.get<MemberResponse[]>(
        `members/junta/${juntaId}`
      );
      return response;
    },
  });

  // Query for prestamos
  const { data: prestamos = [], isLoading: isLoadingPrestamos } = useQuery({
    queryKey: ['prestamos', juntaId],
    queryFn: async () => {
      const response = await api.get<Prestamo[]>(`prestamos/junta/${juntaId}`);
      return response;
    },
  });

  // Query for acciones
  const { data: acciones = [], isLoading: isLoadingAcciones } = useQuery({
    queryKey: ['acciones', juntaId],
    queryFn: async () => {
      const response = await api.get<Accion[]>(`acciones/junta/${juntaId}`);
      return Array.isArray(response) ? response : [];
    },
    staleTime: 0,
  });

  // Calculate member info using acciones data
  const calculateMemberInfo = (memberId: string): MemberInfo => {
    // Get member's acciones
    const memberAcciones = acciones.filter(
      (accion) => accion.memberId === memberId
    );

    // Calculate total acciones count and value
    const accionesCount = memberAcciones.reduce(
      (sum, accion) => sum + accion.amount,
      0
    );
    const accionesValue = memberAcciones.reduce(
      (sum, accion) => sum + accion.amount * accion.shareValue,
      0
    );

    // Calculate active loans value
    const prestamosValue = prestamos
      .filter(
        (prestamo) =>
          prestamo.memberId === memberId &&
          ['PARTIAL', 'PENDING'].includes(prestamo.status)
      )
      .reduce((sum, prestamo) => sum + Number(prestamo.amount), 0);

    return {
      acciones: accionesCount,
      accionesValue,
      prestamosValue,
    };
  };

  // Calculate info for selected member and aval
  const selectedMemberInfo = formData.memberId
    ? calculateMemberInfo(formData.memberId)
    : {
        acciones: 0,
        accionesValue: 0,
        prestamosValue: 0,
      };

  const avalMemberInfo =
    formData.guaranteeType === 'AVAL' && formData.guaranteeDetail
      ? calculateMemberInfo(formData.guaranteeDetail)
      : {
          acciones: 0,
          accionesValue: 0,
          prestamosValue: 0,
        };

  // Mutation for creating loan
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
        form_cost: data.formCost,
        payment_type: 'MENSUAL',
      };

      return api.post('prestamos', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestamos', juntaId] });
      queryClient.invalidateQueries({ queryKey: ['acciones', juntaId] });
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

  // Mutation for deleting loan
  const deleteLoanMutation = useMutation({
    mutationFn: (id: string) => api.delete(`prestamos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestamos', juntaId] });
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

  const calculateLoanValidation = (
    memberId: string,
    requestedAmount: number
  ) => {
    const memberAcciones = acciones.filter(
      (accion) => accion.memberId === memberId
    );

    // Calculate total acciones value
    const accionesValue = memberAcciones.reduce(
      (sum, accion) => sum + accion.amount * accion.shareValue,
      0
    );

    // Calculate active loans value
    const activePrestamosValue = prestamos
      .filter(
        (prestamo) =>
          prestamo.memberId === memberId &&
          ['PARTIAL', 'PENDING'].includes(prestamo.status)
      )
      .reduce((sum, prestamo) => sum + Number(prestamo.amount), 0);

    // Total debt including requested amount
    const totalDebt = activePrestamosValue + requestedAmount;

    return {
      exceedsLimit: totalDebt > accionesValue,
      totalDebt,
      accionesValue,
    };
  };

  const memberValidation = formData.memberId
    ? calculateLoanValidation(formData.memberId, formData.amount)
    : { exceedsLimit: false, totalDebt: 0, accionesValue: 0 };

  const isLoading =
    isLoadingMembers ||
    isLoadingPrestamos ||
    isLoadingAcciones ||
    createLoanMutation.isPending ||
    deleteLoanMutation.isPending;

  return {
    formData,
    members,
    prestamos,
    selectedMemberInfo,
    avalMemberInfo,
    isLoading,
    updateFormData,
    handleInputChange,
    handleSubmit,
    handleDeleteLoan,
    memberValidation,
    calculateLoanValidation,
  };
};
