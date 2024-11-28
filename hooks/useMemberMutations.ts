import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { CreateMemberForm, EditMemberForm } from '@/z';
import { useToast } from '@/hooks/use-toast';


const dateUtils = {
  formatForAPI: (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString();
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  },

  formatForInput: (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  }
};

// Now let's create our comprehensive mutations hook
export function useMemberMutations(juntaId: string, isEditing:boolean) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Helper to format member data consistently for API calls
  const formatMemberData = (data: CreateMemberForm | EditMemberForm) => {
    return {
      ...data,
      birth_date: dateUtils.formatForAPI(data.birth_date),
      join_date: dateUtils.formatForAPI(data.join_date),
    };
  };

  // Helper to invalidate all related queries
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

  // Helper for error handling
  const handleMutationError = (error: unknown) => {
    console.error('Mutation error:', error);
    toast({
      title: 'Error',
      description:
        'Hubo un error al procesar la operación. Por favor intente nuevamente.',
      variant: 'destructive',
    });
  };

  const updateMember = useMutation({
    mutationFn: async ({
      memberId,
      data,
    }: {
      memberId: string;
      data: EditMemberForm;
    }) => {
      const formattedData = formatMemberData(data);
      const response = await api.patch(`members/${memberId}`, formattedData);
      return response;
    },
    onSuccess: () => {
      invalidateMemberQueries();
      toast({
        title: 'Éxito',
        description: `Miembro actualizado exitosamente`,
      });
    },
    onError: handleMutationError,
  });

  const createMember = useMutation({
    mutationFn: async (data: CreateMemberForm) => {
      const formattedData = formatMemberData(data);
      const response = await api.post(
        `members/${juntaId}/add/${data.document_number}`,
        formattedData
      );
      return response;
    },
    onSuccess: () => {
      invalidateMemberQueries();
      toast({
        title: 'Éxito',
        description: 'Miembro agregado exitosamente',
      });
    },
    onError: handleMutationError,
  });

  // Usage in your form hook would look like this:
  const handleFormSubmit = async (data: CreateMemberForm | EditMemberForm) => {
    try {
      if (isEditing && 'id' in data) {
        await updateMember.mutateAsync({
          memberId: data.id,
          data: data as EditMemberForm,
        });
      } else {
        await createMember.mutateAsync(data as CreateMemberForm);
      }
      return true; // Indicate success
    } catch {
      return false; // Indicate failure
    }
  };

  return {
    updateMember,
    createMember,
    handleFormSubmit,
    isLoading: updateMember.isPending || createMember.isPending,
  };
}
