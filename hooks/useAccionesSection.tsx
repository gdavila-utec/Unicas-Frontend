import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useError } from '@/hooks/useError';
import { api } from '@/utils/api';
import {
  Accion,
  CreateAccionDTO,
  AccionFormValues,
  Member,
  ApiResponse,
  User,
  MemberResponse,
} from '@/types';
import { useBoardConfig } from '@/store/configValues';

const formSchema = z.object({
  // memberId: z.string().min(1, { message: 'Miembro requerido' }),
  memberId: z
    .string()
    .min(1)
    .refine((val) => val !== 'no-members', {
      message: 'Por favor seleccione un miembro válido',
    }),
  date: z.date(),
  amount: z.number().min(1, { message: 'La cantidad debe ser mayor a 0' }),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface UseAccionesSectionResult {
  form: ReturnType<typeof useForm<FormValues>>;
  acciones: Accion[];
  members: MemberResponse[];
  isLoading: boolean;
  error: Error | null;
  shareValue: number;
  onSubmit: (values: FormValues) => Promise<void>;
  handleDeleteAcciones: (id: string) => Promise<void>;
  totalShares: number;
  totalValue: number;
}

export const useAccionesSection = (
  juntaId: string
): UseAccionesSectionResult => {
  const { toast } = useToast();
  const { perro, setError } = useError();
  const queryClient = useQueryClient();
  const { shareValue } = useBoardConfig();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberId: 'no-members',
      date: new Date(),
      amount: 1,
      description: '',
    },
  });

  // Query for fetching acciones
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

  const refetch = async () => {
    await Promise.all([
      refetchAcciones(),
      // refetchMembers(),
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['junta', juntaId] }),
    ]);
  };

  // Query for fetching members
  const {
    data: members = [],
    isLoading: isLoadingMembers,
    error: membersError,
  } = useQuery<MemberResponse[]>({
    queryKey: ['members', juntaId],
    queryFn: async () => {
      const response = await api.get<MemberResponse[]>(
        `members/junta/${juntaId}`
      );
      console.log(
        'member data response: ',
        response.filter((member) => member.member_role === 'socio')
      );
      if (!response) return [];
      return response.filter((member) => member.member_role === 'socio');
    },
  });
  // First, let's update the Accion interface to include a proper Partial type
  interface CreateAccionDTO {
    type: 'COMPRA' | 'VENTA';
    amount: number;
    shareValue: number;
    description: string;
    juntaId: string;
    memberId: string; // Add this field explicitly
  }

  // Then update the mutation in the hook
  const createAccionMutation = useMutation({
    mutationFn: async (values: AccionFormValues) => {
      const jsonBody: CreateAccionDTO = {
        type: 'COMPRA',
        amount: values.amount,
        shareValue,
        description: `Compra de acciones por ${
          values.amount
        } acciones el dia ${format(values.date, 'yyyy-MM-dd')}`,
        juntaId,
        memberId: values.memberId,
      };
      return api.post<ApiResponse<Accion>>('acciones', jsonBody);
    },
    onMutate: async (newAccion) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['acciones', juntaId] });
      await queryClient.cancelQueries({ queryKey: ['junta', juntaId] });

      // Snapshot the previous values
      const previousAcciones = queryClient.getQueryData(['acciones', juntaId]);
      const previousJunta = queryClient.getQueryData(['junta', juntaId]);

      // Optimistically update the acciones
      queryClient.setQueryData(['acciones', juntaId], (old: Accion[] = []) => [
        ...old,
        {
          id: 'temp-id',
          ...newAccion,
          createdAt: new Date().toISOString(),
        },
      ]);

      // Update junta capital optimistically
      if (previousJunta) {
        queryClient.setQueryData(['junta', juntaId], (old: any) => ({
          ...old,
          available_capital:
            old.available_capital + newAccion.amount * shareValue,
        }));
      }

      return { previousAcciones, previousJunta };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acciones', juntaId] });
      queryClient.invalidateQueries({ queryKey: ['juntas', juntaId] });
      queryClient.invalidateQueries({ queryKey: ['junta', juntaId] });
      toast({
        title: 'Success',
        description: 'Acciones compradas exitosamente',
      });
      form.reset();
    },
    onError: (error: any) => {
      setError(error);
      toast({
        title: 'Error',
        description: perro || 'Error al crear la acción',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['acciones', juntaId] });
      queryClient.invalidateQueries({ queryKey: ['junta', juntaId] });
      queryClient.invalidateQueries({ queryKey: ['juntas'] });
      queryClient.invalidateQueries({
        queryKey: ['junta', juntaId, 'capital'],
      });
    },
  });

  // Mutation for deleting acciones
  const deleteAccionMutation = useMutation({
    mutationFn: (id: string) => api.delete(`acciones/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acciones', juntaId] });
      queryClient.invalidateQueries({ queryKey: ['junta', juntaId] });
      toast({
        title: 'Success',
        description: 'Accion eliminada exitosamente',
      });
    },
    onError: (error: any) => {
      setError(error);
      toast({
        title: 'Error',
        description: perro,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (values: FormValues) => {
    await createAccionMutation.mutateAsync(values);
  };

  const handleDeleteAcciones = async (id: string) => {
    await deleteAccionMutation.mutateAsync(id);
  };

  // Calculate totals
  const totalShares = acciones.reduce((sum, accion) => sum + accion.amount, 0);
  const totalValue = acciones.reduce(
    (sum, accion) => sum + accion.amount * shareValue,
    0
  );

  return {
    form,
    acciones,
    members,
    isLoading:
      isLoadingAcciones ||
      isLoadingMembers ||
      createAccionMutation.isPending ||
      deleteAccionMutation.isPending,
    error: accionesError || membersError,
    shareValue,
    onSubmit,
    handleDeleteAcciones,
    totalShares,
    totalValue,
  };
};
