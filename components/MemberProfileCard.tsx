import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle, Edit2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { LogoutButton } from '@/components/LogoutButton';
import { transformMemberToFormData } from '@/z';
import type { MemberProfileData, EditMemberForm } from '@/z';
import MemberForm from '@/components/MemberForm';
import { useParams } from 'next/navigation';

interface MemberProfileCardProps {
  memberInfo: MemberProfileData['member'];
  onUpdate: (updates: EditMemberForm) => void;
  formatDate: (date: string) => string;
}

export function MemberProfileCard({
  memberInfo,
  onUpdate,
  formatDate,
}: MemberProfileCardProps) {
  const { role } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const { id: juntaId } = useParams();
  const juntaIdString = Array.isArray(juntaId) ? juntaId[0] : juntaId;
  
  // Transform member data for form
  const formattedMemberData = React.useMemo(
    () => transformMemberToFormData(memberInfo),
    [memberInfo]
  );
  console.log('MemberProfileCard memberInfo: ', memberInfo);
  
  console.log("formattedMemberData: ", formattedMemberData);
  const handleFormSubmit = async (formData: EditMemberForm) => {
    try {
      await onUpdate(formData);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating member:', error);
    }
  };

  const profileItems = [
    { label: 'Nombre', value: memberInfo.full_name },
    { label: 'DNI', value: memberInfo.document_number },
    { label: 'Celular', value: memberInfo.phone },
    { label: 'Cargo', value: memberInfo.role },
    { label: 'Fecha de Ingreso', value: formatDate(memberInfo.join_date) },
    { label: 'Actividad Productiva', value: memberInfo.productive_activity },
  ];

  return (
    <Card className='md:col-span-1'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <UserCircle className='h-6 w-6' />
          Perfil del Socio
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {profileItems.map((item) => (
          <div key={item.label}>
            <p className='text-sm text-gray-500'>{item.label}:</p>
            <p className='font-medium'>{item.value}</p>
          </div>
        ))}

        <div className='w-full flex justify-end px-8'>
          {role === 'ADMIN' ? (
            <Dialog
              open={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                >
                  <Edit2 className='h-4 w-4' />
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                  <DialogTitle>Editar Miembro</DialogTitle>
                </DialogHeader>
                <MemberForm
                  juntaId={juntaIdString}
                  initialData={formattedMemberData}
                  isLoading={false}
                  isEditing={true}
                  onSubmit={handleFormSubmit}
                  onCancel={() => setIsEditDialogOpen(false)}
                  formatDateForInput={formatDate}
                />
              </DialogContent>
            </Dialog>
          ) : (
            <LogoutButton />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
