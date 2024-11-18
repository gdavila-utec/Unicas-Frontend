import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useMembersSection } from '@/hooks/useMembersSection';
import { MembersList } from './MemberList';
import { MemberRole, DocumentType, Gender } from '@/types';

interface MembersSectionProps {
  juntaId: string;
}

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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e);
    setIsModalOpen(false);
  };

  const MemberForm = () => (
    <form
      onSubmit={handleFormSubmit}
      className='space-y-6'
    >
      <div>
        <h3 className='text-lg font-medium'>Información del Miembro</h3>
        <div className='grid grid-cols-2 gap-4 mt-4'>
          <div>
            <Label htmlFor='full_name'>Nombre Completo</Label>
            <Input
              id='full_name'
              value={newMember.full_name}
              onChange={(e) =>
                setNewMember({ ...newMember, full_name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor='document_type'>Tipo de Documento</Label>
            <Select
              value={newMember.document_type}
              onValueChange={(value: DocumentType) => {
                setNewMember({ ...newMember, document_type: value });
              }}
            >
              <SelectTrigger id='document_type'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='DNI'>DNI</SelectItem>
                <SelectItem value='CE'>CE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor='document_number'>Número de Documento</Label>
            <Input
              id='document_number'
              value={newMember.document_number}
              onChange={(e) =>
                setNewMember({
                  ...newMember,
                  document_number: e.target.value,
                })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor='role'>Cargo</Label>
            <Select
              value={newMember.role}
              onValueChange={(value: MemberRole) =>
                setNewMember({ ...newMember, role: value })
              }
            >
              <SelectTrigger id='role'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='socio'>Socio</SelectItem>
                <SelectItem value='presidente'>Presidente</SelectItem>
                <SelectItem value='tesorero'>Tesorero</SelectItem>
                <SelectItem value='secretario'>Secretario</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor='productive_activity'>Actividad Productiva</Label>
            <Input
              id='productive_activity'
              value={newMember.productive_activity}
              onChange={(e) =>
                setNewMember({
                  ...newMember,
                  productive_activity: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label htmlFor='birth_date'>Fecha de Nacimiento</Label>
            <Input
              id='birth_date'
              type='date'
              value={formatDateForInput(newMember.birth_date)}
              onChange={(e) =>
                setNewMember({ ...newMember, birth_date: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor='phone'>Celular</Label>
            <Input
              id='phone'
              value={newMember.phone}
              onChange={(e) =>
                setNewMember({ ...newMember, phone: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor='address'>Dirección</Label>
            <Input
              id='address'
              value={newMember.address}
              onChange={(e) =>
                setNewMember({ ...newMember, address: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor='join_date'>Fecha de Ingreso</Label>
            <Input
              id='join_date'
              type='date'
              value={formatDateForInput(newMember.join_date)}
              onChange={(e) =>
                setNewMember({ ...newMember, join_date: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor='gender'>Género</Label>
            <Select
              value={newMember.gender}
              onValueChange={(value: Gender) =>
                setNewMember({ ...newMember, gender: value })
              }
            >
              <SelectTrigger id='gender'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Masculino'>Masculino</SelectItem>
                <SelectItem value='Femenino'>Femenino</SelectItem>
                <SelectItem value='Otro'>Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor='password'>Contraseña</Label>
            <Input
              id='password'
              type='password'
              value={newMember.password}
              onChange={(e) =>
                setNewMember({ ...newMember, password: e.target.value })
              }
            />
          </div>
        </div>
        <div className='mt-4'>
          <Label htmlFor='additional_info'>Información Adicional</Label>
          <Textarea
            id='additional_info'
            value={newMember.additional_info}
            onChange={(e) =>
              setNewMember({
                ...newMember,
                additional_info: e.target.value,
              })
            }
            className='h-24'
          />
        </div>
      </div>

      <div>
        <h3 className='text-lg font-medium'>Información del Beneficiario</h3>
        <div className='grid grid-cols-2 gap-4 mt-4'>
          <div>
            <Label htmlFor='beneficiary_full_name'>Nombre Completo</Label>
            <Input
              id='beneficiary_full_name'
              value={newMember.beneficiary.full_name}
              onChange={(e) =>
                setNewMember({
                  ...newMember,
                  beneficiary: {
                    ...newMember.beneficiary,
                    full_name: e.target.value,
                  },
                })
              }
            />
          </div>
          <div>
            <Label htmlFor='beneficiary_document_type'>Tipo de Documento</Label>
            <Select
              value={newMember.beneficiary.document_type}
              onValueChange={(value: DocumentType) =>
                setNewMember({
                  ...newMember,
                  beneficiary: {
                    ...newMember.beneficiary,
                    document_type: value,
                  },
                })
              }
            >
              <SelectTrigger id='beneficiary_document_type'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='DNI'>DNI</SelectItem>
                <SelectItem value='CE'>CE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor='beneficiary_document_number'>
              Número de Documento
            </Label>
            <Input
              id='beneficiary_document_number'
              value={newMember.beneficiary.document_number}
              onChange={(e) =>
                setNewMember({
                  ...newMember,
                  beneficiary: {
                    ...newMember.beneficiary,
                    document_number: e.target.value,
                  },
                })
              }
            />
          </div>
          <div>
            <Label htmlFor='beneficiary_phone'>Celular</Label>
            <Input
              id='beneficiary_phone'
              value={newMember.beneficiary.phone}
              onChange={(e) =>
                setNewMember({
                  ...newMember,
                  beneficiary: {
                    ...newMember.beneficiary,
                    phone: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className='col-span-2'>
            <Label htmlFor='beneficiary_address'>Dirección</Label>
            <Input
              id='beneficiary_address'
              value={newMember.beneficiary.address}
              onChange={(e) =>
                setNewMember({
                  ...newMember,
                  beneficiary: {
                    ...newMember.beneficiary,
                    address: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      </div>

      <div className='flex justify-end gap-2'>
        {isEditing && (
          <Button
            type='button'
            variant='outline'
            onClick={() => {
              resetForm();
              setIsModalOpen(false);
            }}
          >
            Cancelar
          </Button>
        )}
        <Button
          type='submit'
          disabled={isLoading}
        >
          {isLoading
            ? 'Procesando...'
            : isEditing
            ? 'Actualizar Miembro'
            : 'Agregar Miembro'}
        </Button>
      </div>
    </form>
  );

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold'>Miembros</h2>
        <Dialog
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
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
            <MemberForm />
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
