import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useToast } from './use-toast';
import axiosInstance from '../utils/axios';
import { useJuntaDialog } from './useJuntaDialog';
import useAuthStore from '../store/useAuthStore';
import { Junta } from '@/types';

// interface Junta {
//   id: number;
//   name: string;
//   centro_poblado?: string;
//   distrito?: string;
//   provincia?: string;
//   available_capital?: number;
// }

interface JuntasState {
  juntas: Junta[];
  isLoading: boolean;
  error: Error | null;
  isRefetching: boolean;
  adminUsers: boolean;
}

interface JuntasActions {
  handleRefetch: () => Promise<void>;
  setAdminUsers: (value: boolean) => void;
  navigateToJunta: (id: number) => void;
  navigateToEdit: (id: number, e: React.MouseEvent) => void;
  handleDelete: (id: string, e: React.MouseEvent) => void;
}

interface DialogState {
  isOpen: boolean;
  openCreate: (callback: () => void) => void;
  close: () => void;
}

interface UseJuntasDashboardResult {
  state: JuntasState;
  actions: JuntasActions;
  dialog: DialogState;
  isAuthenticated: boolean;
}

export const useJuntasDashboard = (): UseJuntasDashboardResult => {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();
  const { isOpen, openCreate, close } = useJuntaDialog();
  const [adminUsers, setAdminUsers] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const fetchJuntas = async () => {
    try {
      const response = await axiosInstance.get('/juntas');
      if (!response?.data) {
        throw new Error('No se recibieron datos del servidor');
      }

      let juntasData = response.data;
      if (response.data.data) {
        juntasData = response.data.data;
      }

      if (!Array.isArray(juntasData)) {
        throw new Error('Formato de respuesta inválido');
      }

      const validJuntas = juntasData.filter(
        (junta) =>
          junta && typeof junta === 'object' && 'id' in junta && 'name' in junta
      );

      if (validJuntas.length === 0) {
        console.warn('No valid juntas found in response:', juntasData);
        return [];
      }

      return validJuntas;
    } catch (error: any) {
      console.error('Error fetching juntas:', {
        error,
        response: error.response,
        data: error.response?.data,
      });

      if (error.response?.status === 401) {
        router.push('/sign-in');
        throw new Error(
          'Sesión expirada. Por favor, inicie sesión nuevamente.'
        );
      }

      throw new Error(
        error.response?.data?.message ||
          'Error al cargar las juntas. Por favor, intente de nuevo.'
      );
    }
  };

  const {
    data: juntas,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['juntas'],
    queryFn: fetchJuntas,
    retry: false,
    staleTime: 6000,
  });

  const handleRefetch = async () => {
    try {
      const result = await refetch();
      if (result.data && result.data.length > 0) {
        toast({
          title: 'Actualizado',
          description: 'Los datos han sido actualizados correctamente.',
        });
      } else {
        toast({
          title: 'Sin datos',
          description: 'No se encontraron juntas para mostrar.',
        });
      }
    } catch (error) {
      console.error('Refetch error:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Error al actualizar los datos',
        variant: 'destructive',
      });
    }
  };

  const navigateToJunta = (id: number) => {
    router.push(`/juntas/${id}`);
  };

  const navigateToEdit = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/juntas/${id}/edit`);
  };

  const deleteJuntaMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/juntas/${id}`);
      return response.data;
    },
    onMutate: async (deletedId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['juntas'] });

      // Snapshot the previous value
      const previousJuntas = queryClient.getQueryData<Junta[]>(['juntas']);

      // Optimistically update to the new value
      if (previousJuntas) {
        queryClient.setQueryData<Junta[]>(
          ['juntas'],
          previousJuntas.filter((junta) => junta.id !== deletedId)
        );
      }

      return { previousJuntas };
    },
    onError: (err, deletedId, context) => {
      // Rollback to the previous value if there's an error
      if (context?.previousJuntas) {
        queryClient.setQueryData(['juntas'], context.previousJuntas);
      }
      toast({
        title: 'Error',
        description:
          err instanceof Error ? err.message : 'Error al eliminar la junta',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Éxito',
        description: 'Junta eliminada correctamente',
      });
      queryClient.invalidateQueries({ queryKey: ['juntas'] });
    },
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    console.log('handleDelete id: ', id);
    e.stopPropagation();

    const confirmed = window.confirm(
      '¿Está seguro que desea eliminar esta junta?'
    );
    if (!confirmed) return;

    try {
      await deleteJuntaMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting junta:', error);
      // Error handling is managed by the mutation callbacks
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/sign-in');
    }
  }, [isAuthenticated, router]);

  return {
    state: {
      juntas: juntas || [],
      isLoading: isLoading || deleteJuntaMutation.isPending,
      error: error as Error | null,
      isRefetching,
      adminUsers,
    },
    actions: {
      handleRefetch,
      setAdminUsers,
      navigateToJunta,
      navigateToEdit,
      handleDelete,
    },
    dialog: {
      isOpen,
      openCreate,
      close,
    },
    isAuthenticated,
  };
};
