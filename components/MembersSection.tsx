import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import {
  useMembersSection,
  defaultFormValues,
} from '@/hooks/useMembersSection';
import { MembersList } from './MemberList';
import MemberForm from './MemberForm';
import {  NewMemberForm } from '../types';

interface MembersSectionProps {
  juntaId: string;
}

// interface NewMemberForm extends FormData {
//   id: string;
//   password: string;
//   name: string;
//   email: string;
// }

const MembersSection: React.FC<MembersSectionProps> = ({ juntaId }) => {
  const { isAuthenticated } = useAuth();
  const {
    members,
    isLoading,
    newMember,
    isEditing,
    handleEditClick,
    handleSubmit,
    handleDeleteMember,
    setNewMember,
    resetForm,
    formatDateForInput,
    updateMemberMutation, // Make sure this is exposed from useMembersSection
  } = useMembersSection(juntaId);

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className='py-4'>
          <p className='text-center text-muted-foreground'>
            Por favor inicie sesión para ver esta sección
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleFormSubmit = async (formData: NewMemberForm) => {
    try {
      if (isEditing) {
        // For updates, call updateMemberMutation directly
        await updateMemberMutation.mutateAsync({
          memberId: formData.id, // Use the ID from the form data
          data: formData,
        });
      } else {
        // For creating new members, use the existing flow
        const syntheticEvent = {
          preventDefault: () => {},
          target: {
            elements: {
              ...formData,
            },
          },
        } as unknown as React.FormEvent;

        setNewMember(formData);
        await handleSubmit(syntheticEvent);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleCancel = () => {
    resetForm();
    setIsModalOpen(false);
  };

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold'>Miembros</h2>
        <Dialog
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) {
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>Agregar Miembro</Button>
          </DialogTrigger>
          <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Editar Miembro' : 'Agregar Miembro'}
              </DialogTitle>
            </DialogHeader>
            <MemberForm
              key={`form-${isEditing ? 'edit' : 'create'}-${
                isEditing ? newMember.id : 'new'
                }`}
              juntaId={juntaId}
              initialData={isEditing ? newMember : defaultFormValues}
              isLoading={isLoading}
              isEditing={isEditing}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              formatDateForInput={formatDateForInput}
            />
          </DialogContent>
        </Dialog>
      </div>

      <MembersList
        members={members}
        onEdit={(member) => {
          handleEditClick(member);
          setIsModalOpen(true);
        }}
        onDelete={handleDeleteMember}
      />
    </div>
  );
};

export default MembersSection;
