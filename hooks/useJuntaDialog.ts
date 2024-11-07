import { useCallback } from 'react';
import { useDialog } from './useDialog';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { api } from '../utils/api';
import { Junta } from '../types';
import { AxiosResponseData } from '../types/api';

export function useJuntaDialog() {
  const dialog = useDialog<Partial<Junta>>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const openEdit = useCallback(
    async (juntaId: string, onSuccess?: () => void) => {
      dialog.setLoading(true);
      try {
        const response = await api.get<Junta>(`juntas/${juntaId}`);
        const juntaData: Partial<Junta> = response.data;
        dialog.open(juntaData, onSuccess);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Error al cargar los datos de la junta',
        });
      } finally {
        dialog.setLoading(false);
      }
    },
    [dialog, toast]
  );

  const openCreate = useCallback(
    (onSuccess?: () => void) => {
      dialog.open(undefined, onSuccess);
    },
    [dialog]
  );

  return {
    ...dialog,
    openEdit,
    openCreate,
  };
}
