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

function MembersList({
  members,
  onEdit,
  onDelete,
}: {
  members: any[];
  onEdit: (member: any, updatedMember: any) => void;
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
                    {/* <Button onClick={() => onEdit(member, {})} variant="outline" size="sm" className="mr-2">
                                        <EditIcon className="h-4 w-4" />
                                    </Button> */}
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

  const [members, setMembers] = useState<any>([]);
  const { isAdmin, isAuthenticated, isLoading, token } = useAuth();

  const handleAddMember = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/members/${juntaId}/add/${newMember.document_number}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          //   body: JSON.stringify(newMember),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data);
      }
      setMembers([...members, data]);
      toast({
        title: 'Éxito',
        description: 'Miembro agregado correctamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  const handleDeleteMember = async (id: number) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/members/${juntaId}/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({ id: id }),
      }
    );
    const data = await response.json();
    setMembers(members.filter((member: any) => member.id !== id));
  };

  const handleUpdateMember = async (id: number, updatedMember: any) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/members/${juntaId}/${id}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedMember),
      }
    );
    const data = await response.json();
    // setMembers(members.map((member : any) => member.id === memberId ? updatedMember : member));
  };

  const handleGetMembers = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/members/junta/${juntaId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const data = await response.json();
    setMembers(data);
  };

  useEffect(() => {
    handleGetMembers();
  }, []);

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
