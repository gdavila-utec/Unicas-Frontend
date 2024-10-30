import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useError } from '@/hooks/useError';
import {
  Member,
  NewMemberForm,
  DocumentType,
  MemberRole,
  Gender,
} from '@/types';

const formatDateForInput = (dateString: string | null | undefined): string => {
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

function MembersList({
  members,
  onEdit,
  onDelete,
}: {
  members: Member[];
  onEdit: (member: Member) => void;
  onDelete: (memberId: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Miembros</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N°</TableHead>
              <TableHead>Nombre completo</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Fecha de Ingreso</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Celular</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Opciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member, index) => (
              <TableRow key={member.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{member.full_name}</TableCell>
                <TableCell>
                  {member.document_type}: {member.document_number}
                </TableCell>
                <TableCell>{formatDateForInput(member.join_date)}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>{member.phone}</TableCell>
                <TableCell>{member.status}</TableCell>
                <TableCell className='space-x-2'>
                  <Button
                    onClick={() => onEdit(member)}
                    variant='outline'
                    size='sm'
                  >
                    <EditIcon className='h-4 w-4' />
                  </Button>
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
                  colSpan={8}
                  className='text-center py-4 text-muted-foreground'
                >
                  No hay miembros registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

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

const MemberSection = ({ juntaId }: { juntaId: string }) => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [newMember, setNewMember] = useState<NewMemberForm>(defaultFormValues);
  const { perro, setError } = useError();

  useEffect(() => {
    if (isEditing && editingMemberId) {
      const currentMember = members.find((m) => m.id === editingMemberId);
      if (currentMember) {
        const editableMember = {
          ...currentMember,
          birth_date: formatDateForInput(currentMember.birth_date),
          join_date: formatDateForInput(currentMember.join_date),
          beneficiary: currentMember.beneficiary || {
            full_name: '',
            document_type: 'DNI',
            document_number: '',
            phone: '',
            address: '',
          },
        };
        setNewMember(editableMember);
      }
    }
  }, [isEditing, editingMemberId, members]);

  const handleEditClick = (member: Member) => {
    try {
      setIsEditing(true);
      setEditingMemberId(member.id);

      // Create a properly formatted member object for editing
      const editableMember: NewMemberForm = {
        id: member.id,
        full_name: member.full_name || '',
        document_type: member.document_type || 'DNI',
        document_number: member.document_number || '',
        role: member.role || 'socio',
        productive_activity: member.productive_activity || '',
        birth_date: member.birth_date
          ? formatDateForInput(member.birth_date)
          : '',
        phone: member.phone || '',
        address: member.address || '',
        join_date: member.join_date ? formatDateForInput(member.join_date) : '',
        gender: member.gender || 'Masculino',
        password: '', // Don't populate password for security
        additional_info: member.additional_info || '',
        beneficiary: {
          full_name: member.beneficiary?.full_name || '',
          document_type: member.beneficiary?.document_type || 'DNI',
          document_number: member.beneficiary?.document_number || '',
          phone: member.beneficiary?.phone || '',
          address: member.beneficiary?.address || '',
        },
      };

      // Use setState callback to ensure state is updated
      setNewMember(editableMember);
      // Force a re-render by updating a timestamp
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Error setting edit mode:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar los datos del miembro',
        variant: 'destructive',
      });
    }
  };

  // Add a state for forcing re-renders
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Add an effect to handle form updates
  useEffect(() => {
    if (isEditing && editingMemberId) {
      const member = members.find((m) => m.id === editingMemberId);
      if (member) {
        console.log('Updating form with member data:', member);
      }
    }
  }, [isEditing, editingMemberId, lastUpdate]);

  // ... (rest of the component remains the same)
  const handleGetMembers = async () => {
    if (!juntaId) return;

    setIsLoading(true);
    try {
      const response = await api.get<Member[]>(`members/junta/${juntaId}`);
      setMembers(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching members:', error);
      setError(error);
      toast({
        title: 'Error',
        description: perro,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMember = async () => {
    setIsLoading(true);
    try {
      // Format dates for API
      const formattedData = {
        ...newMember,
        birth_date: formatDateForAPI(newMember.birth_date),
        join_date: formatDateForAPI(newMember.join_date),
      };

      const response = await api.post(
        `members/${juntaId}/add/${formattedData.document_number}`,
        formattedData
      );

      console.log('response: ', response);
      // Refresh the members list
      await handleGetMembers();

      // Reset form
      resetForm();

      toast({
        title: 'Éxito',
        description: 'Miembro agregado correctamente',
      });
    } catch (error) {
      console.error('Error creating member:', error);
      setError(error);
      const errorMessage = perro || 'Error al agregar miembro';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMember = async (
    memberId: string,
    updatedData: NewMemberForm
  ) => {
    setIsLoading(true);
    try {
      const formattedData = {
        ...updatedData,
        birth_date: formatDateForAPI(updatedData.birth_date),
        join_date: formatDateForAPI(updatedData.join_date),
      };

      await api.put(`members/${juntaId}/${memberId}`, formattedData);
      await handleGetMembers();
      resetForm();
      toast({
        title: 'Éxito',
        description: 'Miembro actualizado correctamente',
      });
    } catch (error) {
      console.error('Error updating member:', error);
      setError(error);
      const errorMessage = perro || 'Error al actualizar miembro';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && juntaId) {
      handleGetMembers();
    }
  }, [isAuthenticated, juntaId]);

  const resetForm = () => {
    setIsEditing(false);
    setEditingMemberId(null);
    setNewMember(defaultFormValues);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingMemberId !== null) {
        await handleUpdateMember(editingMemberId, newMember);
      } else {
        await handleCreateMember();
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

    setIsLoading(true);
    try {
      await api.delete(`members/${juntaId}/${memberId}`);
      await handleGetMembers();
      toast({
        title: 'Éxito',
        description: 'Miembro eliminado correctamente',
      });
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: 'Error',
        description: 'Error al eliminar el miembro',
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
          <CardTitle>
            {isEditing ? 'Editar Miembro' : 'Agregar Miembro'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
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
                  <Label htmlFor='productive_activity'>
                    Actividad Productiva
                  </Label>
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
              <h3 className='text-lg font-medium'>
                Información del Beneficiario
              </h3>
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
                  <Label htmlFor='beneficiary_document_type'>
                    Tipo de Documento
                  </Label>
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
                  onClick={resetForm}
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
        </CardContent>
      </Card>

      <MembersList
        members={members}
        onEdit={handleEditClick}
        onDelete={handleDeleteMember}
      />
    </div>
  );
};

export default MemberSection;
