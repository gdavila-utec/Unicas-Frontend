'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '../../../store/useAuthStore';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';
import axiosInstance from '../../../utils/axios';

type LoginMethod = 'email' | 'phone';

interface FormData {
  email?: string;
  phone_number?: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    role: string;
    username?: string;
    email?: string;
    phone_number?: string;
  };
}

export default function SignInPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone');
  const [formData, setFormData] = useState<FormData>({
    phone_number: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Format phone number if needed
      const formattedData = {
        ...formData,
        phone_number:
          loginMethod === 'phone' && formData.phone_number
            ? formData.phone_number.startsWith('+51')
              ? formData.phone_number
              : `+51${formData.phone_number}`
            : formData.phone_number,
      };

      console.log('data sent: ', {
        ...(loginMethod === 'email'
          ? { email: formData.email }
          : { phone: formattedData.phone_number }),
        password: formData.password,
      });

      const response = await axiosInstance.post<LoginResponse>('/auth/login', {
        ...(loginMethod === 'email'
          ? { email: formData.email }
          : { phone: formattedData.phone_number }),
        password: formData.password,
      });

      const data = response.data;
      console.log('Login successful:', {
        role: data.user.role,
        id: data.user.id,
      });

      // Store token in cookie
      Cookies.set('token', data.access_token, {
        expires: 1, // 1 day
        path: '/',
        sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
        secure: process.env.NODE_ENV === 'production',
      });

      // Store auth data in state
      setAuth({
        token: data.access_token,
        role: data.user.role,
        user: {
          id: data.user.id,
          name: data.user.username,
          email: data.user.email,
          phone: data.user.phone_number,
        },
      });

      // Force a router refresh to update middleware state
      router.refresh();

      // Redirect based on role
      switch (data.user.role.toLowerCase()) {
        case 'admin':
        case 'facilitador':
          router.push('/');
          break;
        case 'member':
          router.push('/');
          break;
        default:
          router.push('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error en el inicio de sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl text-center font-bold'>
            Iniciar Sesión
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* <div className='flex justify-center space-x-4 mb-6'>
            <Button
              type='button'
              variant={loginMethod === 'email' ? 'default' : 'outline'}
              onClick={() => setLoginMethod('email')}
              disabled={loading}
            >
              Email
            </Button>
            <Button
              type='button'
              variant={loginMethod === 'phone' ? 'default' : 'outline'}
              onClick={() => setLoginMethod('phone')}
              disabled={loading}
            >
              Teléfono
            </Button>
          </div> */}

          <form
            className='space-y-4'
            onSubmit={handleSubmit}
          >
            {error && (
              <div className='p-3 text-sm text-red-500 bg-red-50 rounded-md'>
                {error}
              </div>
            )}

            {loginMethod === 'email' ? (
              <div className='space-y-2'>
                <Input
                  id='email'
                  type='email'
                  placeholder='Email'
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            ) : (
              <div className='space-y-2'>
                <Input
                  id='phone_number'
                  type='tel'
                  placeholder='Teléfono (ej: 999999999)'
                  required
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone_number: e.target.value.replace(/\D/g, ''),
                    })
                  }
                  disabled={loading}
                />
                <p className='text-sm text-gray-500'>
                  Ingresa solo números, se agregará el prefijo +51
                  automáticamente
                </p>
              </div>
            )}

            <div className='space-y-2'>
              <Input
                id='password'
                type='password'
                placeholder='Contraseña'
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <Button
              type='submit'
              className='w-full'
              disabled={loading}
            >
              {loading ? (
                <div className='flex items-center justify-center'>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          <div className='mt-4 text-center text-sm'>
            <Link
              href='/sign-up'
              className='text-blue-600 hover:text-blue-500'
            >
              ¿No tienes cuenta? Regístrate
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
