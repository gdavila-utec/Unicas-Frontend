import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/utils/api';
import { useError } from '@/hooks/useError';
import { MemberResponse, NewMemberForm } from '@/types';

const defaultFormValues: NewMemberForm = {
  id: '',
  full_name: '',
  document_type: 'DNI',
  document_number: '',
  role: 'socio',
  productive_activity: '',
  birth_date: '',
  phone: '',
  address: '',
  join_date: new Date().toISOString().split('T')[0],
  gender: 'Masculino',
  password: '',
  additional_info: '',
  beneficiary: {
    full_name: '',
    document_type: 'DNI',
    document_number: '',
    phone: '',
    address: '',
  },
};

interface UseMembersSectionResult {
  members: MemberResponse[];
  isLoading: boolean;
  error: Error | null;
  newMember: NewMemberForm;
  isEditing: boolean;
  editingMemberId: string | null;
  formatDateForInput: (dateString: string | null | undefined) => string;
  formatDateForAPI: (dateString: string) => string;
  handleEditClick: (member: MemberResponse) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleDeleteMember: (memberId: string) => Promise<void>;
  setNewMember: (member: NewMemberForm) => void;
  resetForm: () => void;
}

export const useMembersSection = (juntaId: string): UseMembersSectionResult => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [newMember, setNewMember] = useState<NewMemberForm>(defaultFormValues);
  const { perro, setError } = useError();
  const queryClient = useQueryClient();

  const formatDateForInput = (
    dateString: string | null | undefined
  ): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  const formatDateForAPI = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString();
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  // Query for fetching members
  const {
    data: members = [],
    isLoading: isLoadingMembers,
    error: membersError,
  } = useQuery({
    queryKey: ['members', juntaId],
    queryFn: async () => {
      const response = await api.get<MemberResponse[]>(
        `members/junta/${juntaId}`
      );
      return response.filter((m) => m.member_role === 'socio');
    },
    enabled: isAuthenticated && !!juntaId,
  });

  // Mutation for creating members
  const createMemberMutation = useMutation({
    mutationFn: async (formData: NewMemberForm) => {
      const formattedData = {
        ...formData,
        birth_date: formatDateForAPI(formData.birth_date),
        join_date: formatDateForAPI(formData.join_date),
      };
      return api.post(
        `members/${juntaId}/add/${formattedData.document_number}`,
        formattedData
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', juntaId] });
      toast({
        title: 'Éxito',
        description: 'Miembro agregado correctamente',
      });
      resetForm();
    },
    onError: (error: any) => {
      setError(error);
      const errorMessage = perro || 'Error al agregar miembro';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  // Mutation for updating members
  const updateMemberMutation = useMutation({
    mutationFn: async ({
      memberId,
      data,
    }: {
      memberId: string;
      data: NewMemberForm;
    }) => {
      const formattedData = {
        ...data,
        birth_date: formatDateForAPI(data.birth_date),
        join_date: formatDateForAPI(data.join_date),
      };
      return api.put(`members/${juntaId}/${memberId}`, formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', juntaId] });
      toast({
        title: 'Éxito',
        description: 'Miembro actualizado correctamente',
      });
      resetForm();
    },
    onError: (error: any) => {
      setError(error);
      const errorMessage = perro || 'Error al actualizar miembro';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  // Mutation for deleting members
  const deleteMemberMutation = useMutation({
    mutationFn: (memberId: string) =>
      api.delete(`members/${juntaId}/${memberId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', juntaId] });
      toast({
        title: 'Éxito',
        description: 'Miembro eliminado correctamente',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Error al eliminar el miembro',
        variant: 'destructive',
      });
    },
  });

  const handleEditClick = (member: MemberResponse) => {
    try {
      setIsEditing(true);
      setEditingMemberId(member.id);

      const editableMember: NewMemberForm = {
        id: member.id,
        full_name: member.full_name || '',
        document_type: member.document_type || 'DNI',
        document_number: member.document_number || '',
        role: member.member_role || 'socio',
        productive_activity: member.productive_activity || '',
        birth_date: member.birth_date
          ? formatDateForInput(member.birth_date)
          : '',
        phone: member.phone || '',
        address: member.address || '',
        join_date: member.join_date ? formatDateForInput(member.join_date) : '',
        gender: member.gender || 'Masculino',
        password: '',
        additional_info: member.additional_info || '',
        beneficiary: {
          full_name: member.beneficiary_full_name || '',
          document_type: member.beneficiary_document_type || 'DNI',
          document_number: member.beneficiary_document_number || '',
          phone: member.beneficiary_phone || '',
          address: member.beneficiary_address || '',
        },
      };

      setNewMember(editableMember);
    } catch (error) {
      console.error('Error setting edit mode:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar los datos del miembro',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingMemberId) {
        await updateMemberMutation.mutateAsync({
          memberId: editingMemberId,
          data: newMember,
        });
      } else {
        await createMemberMutation.mutateAsync(newMember);
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({
        title: 'Error',
        description: 'Error al procesar el formulario',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('¿Está seguro de eliminar este miembro?')) return;
    await deleteMemberMutation.mutateAsync(memberId);
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingMemberId(null);
    setNewMember(defaultFormValues);
  };

  return {
    members,
    isLoading:
      isLoadingMembers ||
      createMemberMutation.isPending ||
      updateMemberMutation.isPending ||
      deleteMemberMutation.isPending,
    error: membersError as Error | null,
    newMember,
    isEditing,
    editingMemberId,
    formatDateForInput,
    formatDateForAPI,
    handleEditClick,
    handleSubmit,
    handleDeleteMember,
    setNewMember,
    resetForm,
  };
};
