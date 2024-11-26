import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/utils/api';
import type { MemberResponse as Member, Multa, ApiResponse } from '@/types';
import { useBoardConfig } from '@/store/configValues';

const formSchema = z.object({
  memberId: z.string().min(1, { message: 'Miembro requerido' }),
  reason: z.string().min(1, { message: 'Motivo requerido' }),
  amount: z.number().min(1, { message: 'El monto debe ser mayor a 0' }),
  comments: z.string().optional(),
  date: z.date(),
});

type FormValues = z.infer<typeof formSchema>;

interface UseMultasResult {
  form: ReturnType<typeof useForm<FormValues>>;
  members: Member[];
  multas: Multa[];
  isLoading: boolean;
  error: Error | null;
  onSubmit: (values: FormValues) => Promise<void>;
  handleDeleteMulta: (id: string) => Promise<void>;
}

export const useMultas = (juntaId: string): UseMultasResult => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
    const {  latePaymentFee } = useBoardConfig();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberId: '',
      reason: 'TARDANZA',
      amount: latePaymentFee,
      comments: '',
      date: new Date(),
    },
  });

  // Query for fetching members
  const {
    data: members = [],
    isLoading: isLoadingMembers,
    error: membersError,
  } = useQuery<Member[]>({
    queryKey: ['members', juntaId],
    queryFn: async () => {
      const response = await api.get<Member[]>(`members/junta/${juntaId}`);
      return response;
    },
  });

  // Query for fetching multas
  const {
    data: multas = [],
    isLoading: isLoadingMultas,
    error: multasError,
  } = useQuery<Multa[]>({
    queryKey: ['multas', juntaId],
    queryFn: async () => {
      const response = await api.get<Multa[]>(`multas/junta/${juntaId}`);
      return response;
    },
  });

  // Mutation for creating multa
  const createMultaMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      return api.post<Multa>(`multas`, {
        juntaId,
        memberId: values.memberId,
        description: values.reason,
        amount: values.amount,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['multas', juntaId] });
      queryClient.invalidateQueries({ queryKey: ['junta', juntaId] });
      toast({
        title: 'Éxito',
        description: 'Multa registrada correctamente',
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Error al registrar la multa',
        variant: 'destructive',
      });
    },
  });

  // Mutation for deleting multa
  const deleteMultaMutation = useMutation({
    mutationFn: (id: string) => api.delete(`multas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['multas', juntaId] });
      queryClient.invalidateQueries({ queryKey: ['junta', juntaId] });
      toast({
        title: 'Éxito',
        description: 'Multa eliminada correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Error al eliminar la multa',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (values: FormValues) => {
    await createMultaMutation.mutateAsync(values);
  };

  const handleDeleteMulta = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar esta multa?')) {
      await deleteMultaMutation.mutateAsync(id);
    }
  };

  return {
    form,
    members,
    multas,
    isLoading:
      isLoadingMembers ||
      isLoadingMultas ||
      createMultaMutation.isPending ||
      deleteMultaMutation.isPending,
    error: membersError || multasError,
    onSubmit,
    handleDeleteMulta,
  };
};
