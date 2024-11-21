'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useAuthStore from '@/store/useAuthStore';
import { api } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  user: string;
  phone: string;
  email: string;
  role: string;
}

export default function GestionUsuarios() {
  const { token } = useAuthStore();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await api.get<User[]>('users');
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error al cargar usuarios',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await api.put(`users/${userId}/role`, { role: newRole });

      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      toast({
        title: 'Éxito',
        description: 'Rol actualizado correctamente',
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error al actualizar el rol',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <div>Cargando usuarios...</div>;
  }

  return (
    <div className='container mx-auto py-6 mt-5 p-5'>
      <Table>
        <TableHeader>
          <TableRow className=''>
            <TableHead>Usuario</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefono</TableHead>
            <TableHead>Rol Actual</TableHead>
            <TableHead>Cambiar Rol</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.user}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>{user.role || 'user'}</TableCell>
              <TableCell>
                <Select
                  defaultValue={user.role || 'user'}
                  onValueChange={(value) => updateUserRole(user.id, value)}
                >
                  <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder='Seleccionar rol' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='admin'>ADMIN</SelectItem>
                    <SelectItem value='user'>USER</SelectItem>
                    <SelectItem value='member'>MIEMBRO</SelectItem>
                    <SelectItem value='member'>FACILITADOR</SelectItem>
                    <SelectItem value='member'>PRESIDENTE</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
