import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/utils/api';
import { useError } from '@/hooks/useError';
import {
  MemberResponse,
  DocumentType,
  MemberRole,
  Gender,
  Role,
  UserStatus,
  NewMemberForm,
} from '@/types';
import {
  CreateMemberForm,
  EditMemberForm,
  // createMemberSchema,
  editMemberSchema,
  isEditMemberForm,
} from '@/z';

// export const defaultFormValues: CreateMemberForm = {
//   full_name: '',
//   document_type: 'DNI',
//   document_number: '',
//   role: 'socio',
//   productive_activity: '',
//   birth_date: new Date().toISOString().split('T')[0],
//   phone: '',
//   address: '',
//   join_date: new Date().toISOString().split('T')[0],
//   gender: 'Masculino',
//   password: '',
//   additional_info: '',
//   beneficiary: {
//     full_name: '',
//     document_type: 'DNI',
//     document_number: '',
//     phone: '',
//     address: '',
//   },
// };

export const defaultFormValues: NewMemberForm = {
  id: '', // Added id field
  full_name: '',
  document_type: 'DNI',
  document_number: '',
  role: 'socio',
  productive_activity: '',
  birth_date: new Date().toISOString().split('T')[0],
  phone: '',
  address: '',
  join_date: new Date().toISOString().split('T')[0],
  gender: 'Masculino',
  password: '', // Changed from optional to required
  additional_info: '',
  beneficiary: {
    full_name: '',
    document_type: 'DNI',
    document_number: '',
    phone: '',
    address: '',
  },
};

const createOptimisticMember = (
  newMember: CreateMemberForm | EditMemberForm
): MemberResponse => ({
  id: 'id' in newMember ? newMember.id : 'temp-' + Date.now(),
  username: newMember.document_number,
  email: null,
  full_name: newMember.full_name || null,
  document_type: newMember.document_type as DocumentType | null,
  document_number: newMember.document_number || null,
  phone: newMember.phone || null,
  address: newMember.address || null,
  birth_date: newMember.birth_date || null,
  gender: newMember.gender as Gender | null,
  productive_activity: newMember.productive_activity || null,
  role: 'USER' as Role,
  member_role: newMember.role as MemberRole | null,
  status: 'Activo' as UserStatus,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  joinedAt: new Date().toISOString(),
  additional_info: newMember.additional_info || null,
  beneficiary_address: newMember.beneficiary.address || null,
  beneficiary_document_number: newMember.beneficiary.document_number || null,
  beneficiary_document_type: newMember.beneficiary
    .document_type as DocumentType | null,
  beneficiary_full_name: newMember.beneficiary.full_name || null,
  beneficiary_phone: newMember.beneficiary.phone || null,
  join_date: newMember.join_date || null,
});

// Role mapping helper
// const mapRoleTypes = (role: string) => ({
//   role,
//   member_role: role,
// });

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
// const {
//   data: members = [],
//   isLoading: isLoadingMembers,
//   error: membersError,
// } = useQuery({
//   queryKey: ['members', juntaId],
//   queryFn: async () => {
//     const response = await api.get<MemberResponse[]>(
//       `members/junta/${juntaId}`
//     );
//     return response
//       .filter((m) => m.member_role !== null && m.member_role === 'socio')
//       .map((member) => ({
//         ...member,
//         ...mapRoleTypes(member.member_role || 'socio'), // Provide default value
//       }));
//   },
//   enabled: isAuthenticated && !!juntaId,
//   staleTime: 0,
//   refetchInterval: 1000,
// });

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
export const useMembersSection = (juntaId: string) => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [newMember, setNewMember] = useState<NewMemberForm>(defaultFormValues);
  const { perro, setError } = useError();
  const queryClient = useQueryClient();

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
    staleTime: 0,
    refetchInterval: 1000,
  });

  const createMemberMutation = useMutation({
    mutationFn: async (formData: CreateMemberForm) => {
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
    onMutate: async (newMember) => {
      await queryClient.cancelQueries({ queryKey: ['members', juntaId] });
      const previousMembers = queryClient.getQueryData<MemberResponse[]>([
        'members',
        juntaId,
      ]);
      const optimisticMember = createOptimisticMember(newMember);

      queryClient.setQueryData<MemberResponse[]>(['members', juntaId], (old) =>
        old ? [...old, optimisticMember] : [optimisticMember]
      );

      return { previousMembers, optimisticMember };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', juntaId] });
      toast({ title: 'Éxito', description: 'Miembro agregado correctamente' });
      resetForm();
    },
    onError: (error, _, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(['members', juntaId], context.previousMembers);
      }
      setError(error);
      toast({
        title: 'Error',
        description: perro || 'Error al agregar miembro',
        variant: 'destructive',
      });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: async (formData: EditMemberForm) => {
      const validated = editMemberSchema.parse(formData);
      const formattedData = {
        ...validated,
        birth_date: formatDateForAPI(validated.birth_date),
        join_date: formatDateForAPI(validated.join_date),
      };
      return api.patch(`members/${formData.id}`, formattedData);
    },
    onMutate: async (updatedMember) => {
      await queryClient.cancelQueries({ queryKey: ['members', juntaId] });
      const previousMembers = queryClient.getQueryData<MemberResponse[]>([
        'members',
        juntaId,
      ]);

      const updatedOptimisticMember = {
        ...createOptimisticMember({ ...updatedMember, password: updatedMember.password || '' }),
        id: updatedMember.id,
      };

      queryClient.setQueryData<MemberResponse[]>(
        ['members', juntaId],
        (old) =>
          old?.map((member) =>
            member.id === updatedMember.id ? updatedOptimisticMember : member
          ) || []
      );

      return { previousMembers };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', juntaId] });
      toast({
        title: 'Éxito',
        description: 'Miembro actualizado correctamente',
      });
      resetForm();
    },
    onError: (error, _, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(['members', juntaId], context.previousMembers);
      }
      setError(error);
      toast({
        title: 'Error',
        description: perro || 'Error al actualizar miembro',
        variant: 'destructive',
      });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return api.delete(`members/${juntaId}/${memberId}`);
    },
    onMutate: async (memberId) => {
      await queryClient.cancelQueries({ queryKey: ['members', juntaId] });
      const previousMembers = queryClient.getQueryData<MemberResponse[]>([
        'members',
        juntaId,
      ]);

      queryClient.setQueryData<MemberResponse[]>(['members', juntaId], (old) =>
        (old || []).filter((member) => member.id !== memberId)
      );

      return { previousMembers };
    },
    onSuccess: () => {
      toast({
        title: 'Éxito',
        description: 'Miembro eliminado correctamente',
      });
    },
    onError: (error, _, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(['members', juntaId], context.previousMembers);
      }
      setError(error);
      toast({
        title: 'Error',
        description: perro || 'Error al eliminar miembro',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['members', juntaId] });
    },
  });

  const handleEditClick = (member: MemberResponse) => {
    setIsEditing(true);
    setEditingMemberId(member.id);

    const editableMember: EditMemberForm = {
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
      password: '', // Provide empty string as default for password
      additional_info: member.additional_info || '',
      beneficiary: {
        full_name: member.beneficiary_full_name || '',
        document_type: member.beneficiary_document_type || 'DNI',
        document_number: member.beneficiary_document_number || '',
        phone: member.beneficiary_phone || '',
        address: member.beneficiary_address || '',
      },
    };

    setNewMember(editableMember as NewMemberForm); // Type assertion to match state type
  };

  const handleSubmit = async (formData: CreateMemberForm | EditMemberForm) => {
    try {
      if (isEditMemberForm(formData)) {
        await updateMemberMutation.mutateAsync(formData);
      } else {
        await createMemberMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error('Error in form submission:', error);
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
      updateMemberMutation.isPending,
    error: membersError as Error | null,
    newMember,
    isEditing,
    editingMemberId,
    formatDateForInput,
    formatDateForAPI,
    handleEditClick,
    handleSubmit,
    handleDeleteMember,
    updateMemberMutation,
    setNewMember,
    resetForm,
  };
};
