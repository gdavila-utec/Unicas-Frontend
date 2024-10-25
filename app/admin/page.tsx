'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
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

interface User {
  id: string;
  user: string;
  phone: string;
  username: string;
  email: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has admin role
    const checkAdminAccess = async () => {
      if (!user) {
        router.push('/sign-in');
        return;
      }

      // Here you would typically check if the user has admin role
      // For now, we'll use a placeholder check
      const isAdmin = user.publicMetadata.role === 'admin';
      if (!isAdmin) {
        router.push('/');
      }
    };

    const fetchUsers = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
    fetchUsers();
  }, [user, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-2xl font-bold mb-6'>
        Admin Dashboard - User Management
      </h1>
      <Table>
        <TableCaption>A list of all users in the system</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Username/DNI</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Date Created</TableHead>
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
    </div>
  );
}
