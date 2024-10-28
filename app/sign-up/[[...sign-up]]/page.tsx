'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import useAuthStore from '@/store/useAuthStore';

export default function SignUpPage() {
  const { isAdmin, role, isAuthenticated, token } = useAuthStore();
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone_number: '',
    password: '',
    username: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  console.log('loading: ', loading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error en el registro');
      }

      router.push('/sign-in');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md'>
        <div>
          <h2 className='text-center text-3xl font-bold tracking-tight text-gray-900'>
            Registro de Usuario
          </h2>
        </div>
        <form
          className='mt-8 space-y-6'
          onSubmit={handleSubmit}
        >
          {error && (
            <div className='rounded-md bg-red-50 p-4 text-red-500'>{error}</div>
          )}
          <div className='space-y-4 rounded-md shadow-sm'>
            <div>
              <label
                htmlFor='phone_number'
                className='sr-only'
              >
                Celular
              </label>
              <input
                id='phone_number'
                name='phone_number'
                type='text'
                required
                className='relative block w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500'
                placeholder='Telefono'
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
              />
            </div>
            <div>
              <label
                htmlFor='username'
                className='sr-only'
              >
                DNI:
              </label>
              <input
                id='username'
                name='username'
                type='username'
                required
                className='relative block w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500'
                placeholder='DNI'
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>
            <div>
              <label
                htmlFor='password'
                className='sr-only'
              >
                Contraseña
              </label>
              <input
                id='password'
                name='password'
                type='password'
                required
                className='relative block w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500'
                placeholder='Contraseña'
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <button
              type='submit'
              disabled={loading}
              className='group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-300'
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </div>
        </form>

        <div className='text-center text-sm'>
          <Link
            href='/sign-up/admin'
            className='text-blue-600 hover:text-blue-500'
          >
            Registro de Administrador
          </Link>
          <span className='mx-2'>|</span>
          <Link
            href='/sign-in'
            className='text-blue-600 hover:text-blue-500'
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
