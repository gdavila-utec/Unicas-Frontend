import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { memberProfileSchema, type MemberProfileData } from '@/z';
import { formatDate } from '@/utils/date';
import { useToast } from '@/hooks/use-toast';

export function useMemberProfile(
  memberId: string | undefined,
  juntaId: string
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidateMemberQueries = () => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const [resource] = query.queryKey;
        return ['members', 'memberStats', 'member'].includes(
          resource as string
        );
      },
    });
  };

  const { data, isLoading, error } = useQuery<MemberProfileData>({
    queryKey: ['memberProfile', memberId, juntaId],
    queryFn: async () => {
      if (!memberId) throw new Error('Member ID is required');
      if (!juntaId) throw new Error('Junta ID is required');

      const response = await api.get(`members/${memberId}`, {
        params: { juntaId },
      });
      return response;
    },
    enabled: !!memberId && !!juntaId,
  });

    const formatDateForDisplay = (date: string | null | undefined) => {
      if (!date) return '';
      try {
        return formatDate(date, 'dd/MM/yyyy');
      } catch (error) {
        console.error('Error formatting date:', error);
        return '';
      }
    };

  const transformedData = data
    ? {
        memberInfo: {
          ...data.member,
          fechaNacimiento: data.member?.birth_date
            ? formatDateForDisplay(data.member?.birth_date)
            : '',
          fechaIngreso: data.member.birth_date
            ? formatDateForDisplay(data.member.birth_date)
            : '',
        },
        acciones: data.acciones.resumen,
        prestamosActivos: data.prestamos.activos,
        prestamosHistorial: data.prestamos.historial,
        multasPendientes: data.multas.pendientes,
        multasHistorial: data.multas.historial,
        accionesDetalle: data.acciones.detalle,
      }
    : undefined;

  const updateMember = useMutation({
    mutationFn: async (updates: Partial<MemberProfileData['member']>) => {
      if (!memberId) throw new Error('Member ID is required');
      const response = await api.patch(`members/${memberId}`, updates);
      return memberProfileSchema.parse(response);
    },
    onSuccess: () => {
      invalidateMemberQueries();
      toast({
        title: 'Éxito',
        description: 'Miembro actualizado correctamente',
      });
    },
  });



  return {
    data: transformedData,
    isLoading,
    error,
    updateMember,
    formatDateForDisplay,
  };
}
