'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import GestionUsuarios from '@/components/GestionUsuarios';
import useAuthStore from '@/store/useAuthStore';

interface User {
  id: string;
  user: string;
  phone: string;
  username: string;
  email: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const { isAuthenticated, isAdmin, token } = useAuthStore();

  useEffect(() => {
    // Check if user has admin role
    const checkAdminAccess = async () => {
      if (!isAuthenticated) {
        router.push('/sign-in');
        return;
      }

      if (!isAdmin) {
        router.push('/');
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setUsers(data);
        // Handle the data...
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
    fetchUsers();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-2xl font-bold mb-6'>Panel de Administración</h1>

      <div className='flex space-x-4 mb-6'>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 'users'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setActiveTab('users')}
        >
          Lista de Usuarios
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 'roles'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setActiveTab('roles')}
        >
          Gestión de Roles
        </button>
      </div>

      {activeTab === 'users' ? (
        <Table>
          <TableCaption>Lista de todos los usuarios en el sistema</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Username/DNI</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Fecha de Creación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.user}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <GestionUsuarios />
      )}
    </div>
  );
}
