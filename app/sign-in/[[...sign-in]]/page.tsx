'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../../store/useAuthStore';
import Image from 'next/image';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Card,
  CardContent,
} from '../../../components/ui/card';
import { Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';
import axiosInstance from '../../../utils/axios';
import { Eye, EyeOff } from 'lucide-react';



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
  const [showPassword, setShowPassword] = useState(false);
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
      const response = await axiosInstance.post<LoginResponse>('/auth/login', {
        phone: formData.phone_number,
        password: formData.password,
      });

      const data = response.data;
      console.log("data: ", data);
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

      console.log("data.user.role: ", data.user.role);
      // Redirect based on role
      switch (data.user.role.toLowerCase()) {
        case 'admin':
        case 'facilitador':
          router.push('/');
          break;
        case 'user':
          router.push(`/member?socioId=${data.user.id}`); 
          break;
        default:
          router.push('/404');
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
      <Card className='w-full max-w-md flex flex-col items-center bg-[#1763b8] p-8 gap-8'>
        <Image
          src='/logo.png'
          alt='logo'
          width={200}
          height={20}
        />


        <CardContent>
          <form
            className='space-y-4'
            onSubmit={handleSubmit}
          >
            {error && (
              <div className='p-3 text-sm text-red-500 bg-red-50 rounded-md'>
                {error}
              </div>
            )}
            <div className='space-y-2 bg-white rounded-md' >
              <Input
                id='phone_number'
                type='tel'
                placeholder='Teléfono (ej: 999999999)'
                required
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div className='space-y-2'>
              <div className='space-y-2'>
                <div className='relative bg-white rounded-md' >
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Contraseña'
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    disabled={loading}
                    className='pr-10' // Add padding for the icon
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none'
                    tabIndex={-1} // Remove from tab sequence
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff
                        className='h-5 w-5'
                        aria-hidden='true'
                      />
                    ) : (
                      <Eye
                        className='h-5 w-5'
                        aria-hidden='true'
                      />
                    )}
                    <span className='sr-only'>
                      {showPassword
                        ? 'Ocultar contraseña'
                        : 'Mostrar contraseña'}
                    </span>
                  </button>
                </div>
              </div>
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
        </CardContent>
      </Card>
    </div>
  );
}
