import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/utils/api';
import { useError } from '@/hooks/useError';
import { MemberResponse, NewMemberForm } from '@/types';
import { UseMutationResult } from '@tanstack/react-query';

export type DocumentType = 'DNI' | 'CE';

// export interface MemberResponse {
//   id: string;
//   full_name: string;
//     document_type: DocumentType;
//   document_number: string;
//   member_role: string;
//   productive_activity?: string;
//   birth_date?: string;
//   phone?: string;
//   address?: string;
//   join_date?: string;
//   gender?: string;
//   additional_info?: string;
//   beneficiary_full_name?: string;
//   beneficiary_document_type?: string;
//   beneficiary_document_number?: string;
//   beneficiary_phone?: string;
//   beneficiary_address?: string;
// }

// export interface NewMemberForm {
//   id: string;
//   full_name: string;
//   document_type: 'DNI' | 'CE';
//   document_number: string;
//   role: 'socio' | 'presidente' |  'facilitador';
//   productive_activity: string;
//   birth_date: string;
//   phone: string;
//   address: string;
//   join_date: string;
//   gender: 'Masculino' | 'Femenino';
//   password: string;
//   additional_info: string;
//   beneficiary: {
//     full_name: string;
//     document_type: 'DNI' | 'CE';
//     document_number: string;
//     phone: string;
//     address: string;
//   };
// }


export const defaultFormValues: NewMemberForm = {
  id: '',
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
  updateMemberMutation: UseMutationResult<
    unknown,
    unknown,
    UpdateMemberVariables,
    unknown
  >;
}

// Make sure to define UpdateMemberVariables type
type UpdateMemberVariables = {
  memberId: string;
  data: NewMemberForm;
};

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
      console.log("formData: ", formData);
      const formattedData = {
        ...formData,
        birth_date: formatDateForAPI(
          formData.birth_date || new Date().toISOString().split('T')[0]
        ),
        join_date: formatDateForAPI(formData.join_date),
      };
      console.log('Formatted data being sent:', formattedData); 
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
    onError: (error: unknown) => {
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
       const response = await api.patch(`members/${memberId}`, formattedData);
       return response;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['members', juntaId] });
       toast({
         title: 'Éxito',
         description: 'Miembro actualizado correctamente',
       });
       resetForm();
     },
     onError: (error: unknown) => {
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
        id: member.id || '',
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
        password: '', // This might be missing
        additional_info: member.additional_info || '',
        beneficiary: {
          full_name: member.beneficiary_full_name || '',
          document_type: member.beneficiary_document_type || 'DNI',
          document_number: member.beneficiary_document_number || '',
          phone: member.beneficiary_phone || '',
          address: member.beneficiary_address || '',
        },
      };

      setNewMember(editableMember); // Here's where we need to ensure password is included
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
    updateMemberMutation,
  };
};


