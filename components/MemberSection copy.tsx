import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EditIcon, Trash2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/utils/api';
import { useCallback } from 'react';

interface Member {
  id: number;
  full_name: string;
  document_type: string;
  document_number: string;
  shares: number;
}

interface NewMemberForm {
  first_name: string;
  last_name: string;
  document_type: 'DNI' | 'CE';
  document_number: string;
  birth_date: string;
  province: string;
  district: string;
  address: string;
  is_superuser: boolean;
}

function MembersList({
  members,
  onEdit,
  onDelete,
}: {
  members: Member[];
  onEdit: (member: Member, updatedMember: Partial<Member>) => void;
  onDelete: (memberId: number) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de socios</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Acciones</TableHead>
              <TableHead>Opciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.full_name}</TableCell>
                <TableCell>
                  {member.document_type}: {member.document_number}
                </TableCell>
                <TableCell>{member.shares}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => onDelete(member.id)}
                    variant='outline'
                    size='sm'
                  >
                    <Trash2Icon className='h-4 w-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {members.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className='text-center text-muted-foreground'
                >
                  No hay socios registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

const MemberSection = ({ juntaId }: { juntaId: string }) => {
  const { toast } = useToast();
  const [newMember, setNewMember] = useState<NewMemberForm>({
    first_name: '',
    last_name: '',
    document_type: 'DNI',
    document_number: '',
    birth_date: '',
    province: '',
    district: '',
    address: '',
    is_superuser: false,
  });

  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAdmin, isAuthenticated } = useAuth();

  const handleGetMembers = useCallback(async () => {
    if (!isAuthenticated || !juntaId) return;

    setIsLoading(true);
    try {
      const response = await api.get<Member[]>(`members/junta/${juntaId}`);
      console.log('Fetched members:', response);
      if (Array.isArray(response)) {
        setMembers(response);
      } else {
        console.error('Invalid response format:', response);
        toast({
          title: 'Error',
          description: 'Formato de respuesta inválido',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error al cargar miembros',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, juntaId, toast]);

  useEffect(() => {
    handleGetMembers();
  }, [handleGetMembers]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (
      !newMember.first_name ||
      !newMember.last_name ||
      !newMember.document_number
    ) {
      toast({
        title: 'Error',
        description: 'Por favor complete los campos requeridos',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      const memberData = {
        ...newMember,
        full_name: `${newMember.first_name} ${newMember.last_name}`,
      };

      console.log('Sending member data:', memberData);

      const response = await api.post<Member>(
        `members/${juntaId}/add/${newMember.document_number}`,
        memberData
      );

      console.log('Add member response:', response);

      if (response && response.id) {
        // Fetch the updated list instead of updating state directly
        await handleGetMembers();

        setNewMember({
          first_name: '',
          last_name: '',
          document_type: 'DNI',
          document_number: '',
          birth_date: '',
          province: '',
          district: '',
          address: '',
          is_superuser: false,
        });

        toast({
          title: 'Éxito',
          description: 'Miembro agregado correctamente',
        });
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error al agregar miembro',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMember = async (id: number) => {
    setIsLoading(true);
    try {
      await api.delete(`members/${juntaId}/${id}`);
      // Fetch the updated list instead of updating state directly
      await handleGetMembers();

      toast({
        title: 'Éxito',
        description: 'Miembro eliminado correctamente',
      });
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error al eliminar miembro',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMember = async (
    member: Member,
    updatedMember: Partial<Member>
  ) => {
    setIsLoading(true);
    try {
      await api.put<Member>(`members/${juntaId}/${member.id}`, updatedMember);
      // Fetch the updated list instead of updating state directly
      await handleGetMembers();

      toast({
        title: 'Éxito',
        description: 'Miembro actualizado correctamente',
      });
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Error al actualizar miembro',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className='flex flex-col gap-4'>
      <Card>
        <CardHeader>
          <CardTitle>Agregar Miembro</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleAddMember}
            className='space-y-4'
          >
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='first_name'>Nombres*</Label>
                <Input
                  id='first_name'
                  value={newMember.first_name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, first_name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor='last_name'>Apellidos*</Label>
                <Input
                  id='last_name'
                  value={newMember.last_name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, last_name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor='document_type'>Tipo de Documento*</Label>
                <Select
                  value={newMember.document_type}
                  onValueChange={(value: 'DNI' | 'CE') =>
                    setNewMember({ ...newMember, document_type: value })
                  }
                >
                  <SelectTrigger id='document_type'>
                    <SelectValue placeholder='Seleccionar tipo' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='DNI'>DNI</SelectItem>
                    <SelectItem value='CE'>CE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor='document_number'>Número de Documento*</Label>
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
                <Label htmlFor='birth_date'>Fecha de Nacimiento</Label>
                <Input
                  id='birth_date'
                  type='date'
                  value={newMember.birth_date}
                  onChange={(e) =>
                    setNewMember({ ...newMember, birth_date: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor='province'>Provincia</Label>
                <Input
                  id='province'
                  value={newMember.province}
                  onChange={(e) =>
                    setNewMember({ ...newMember, province: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor='district'>Distrito</Label>
                <Input
                  id='district'
                  value={newMember.district}
                  onChange={(e) =>
                    setNewMember({ ...newMember, district: e.target.value })
                  }
                />
              </div>
              <div className='col-span-2'>
                <Label htmlFor='address'>Dirección</Label>
                <Input
                  id='address'
                  value={newMember.address}
                  onChange={(e) =>
                    setNewMember({ ...newMember, address: e.target.value })
                  }
                />
              </div>
              <div className='col-span-2 flex items-center space-x-2'>
                <Input
                  id='is_superuser'
                  type='checkbox'
                  checked={newMember.is_superuser}
                  onChange={(e) =>
                    setNewMember({
                      ...newMember,
                      is_superuser: e.target.checked,
                    })
                  }
                  className='h-4 w-4'
                />
                <Label
                  htmlFor='is_superuser'
                  className='text-sm'
                >
                  Es Administrador
                </Label>
              </div>
            </div>
            {/* <Button type='submit'>Agregar Miembro</Button> */}
            <Button
              type='submit'
              disabled={isLoading}
            >
              {isLoading ? 'Procesando...' : 'Agregar Miembro'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <MembersList
        members={members}
        onDelete={handleDeleteMember}
        onEdit={handleUpdateMember}
      />
    </div>
  );
};

export default MemberSection;
