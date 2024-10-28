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

interface Member {
  id: number;
  full_name: string;
  document_type: string;
  document_number: string;
  shares: number;
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
            {members.length > 0 &&
              members.map((member) => (
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
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

const MemberSection = ({ juntaId }: { juntaId: string }) => {
  const { toast } = useToast();
  const [newMember, setNewMember] = useState({
    first_name: '',
    last_name: '',
    document_type: 'DNI' as 'DNI' | 'CE',
    document_number: '',
    birth_date: '',
    province: '',
    district: '',
    address: '',
    is_superuser: false,
  });

  const [members, setMembers] = useState<Member[]>([]);
  const { isAdmin, isAuthenticated } = useAuth();

  const handleAddMember = async () => {
    try {
      const data = await api.post<Member>(
        `members/${juntaId}/add/${newMember.document_number}`
      );

      setMembers([...members, data]);
      toast({
        title: 'Éxito',
        description: 'Miembro agregado correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error al agregar miembro',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMember = async (id: number) => {
    try {
      await api.delete(`members/${juntaId}/${id}`);
      setMembers(members.filter((member) => member.id !== id));
      toast({
        title: 'Éxito',
        description: 'Miembro eliminado correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error al eliminar miembro',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateMember = async (
    member: Member,
    updatedMember: Partial<Member>
  ) => {
    try {
      const data = await api.put<Member>(
        `members/${juntaId}/${member.id}`,
        updatedMember
      );
      setMembers(members.map((m) => (m.id === member.id ? data : m)));
      toast({
        title: 'Éxito',
        description: 'Miembro actualizado correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Error al actualizar miembro',
        variant: 'destructive',
      });
    }
  };

  const handleGetMembers = async () => {
    try {
      const data = await api.get<Member[]>(`members/junta/${juntaId}`);
      setMembers(data);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error al cargar miembros',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      handleGetMembers();
    }
  }, [isAuthenticated, juntaId]);

  return (
    <div className='flex flex-col gap-2'>
      <Card>
        <CardHeader>
          <CardTitle>Agregar Miembro</CardTitle>
        </CardHeader>
        <CardContent>
          <form className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='firt_name'>Nombres</Label>
                <Input
                  id='firt_name'
                  value={newMember.first_name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, first_name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor='last_name'>Apellidos</Label>
                <Input
                  id='last_name'
                  value={newMember.last_name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, last_name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor='documentType'>Tipo de Documento</Label>
                <Select
                  value={newMember.document_type}
                  onValueChange={(value: 'DNI' | 'CE') =>
                    setNewMember({ ...newMember, document_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Seleccionar tipo' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='DNI'>DNI</SelectItem>
                    <SelectItem value='CE'>CE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor='documentNumber'>Número de Documento</Label>
                <Input
                  id='documentNumber'
                  value={newMember.document_number}
                  onChange={(e) =>
                    setNewMember({
                      ...newMember,
                      document_number: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor='birthDate'>Fecha de Nacimiento</Label>
                <Input
                  id='birthDate'
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
                  id='isAdmin'
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
                  htmlFor='isAdmin'
                  className='text-sm'
                >
                  Es Administrador
                </Label>
              </div>
            </div>
            <Button
              type='button'
              onClick={handleAddMember}
            >
              Agregar Miembro
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
