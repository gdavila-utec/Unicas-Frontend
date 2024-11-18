'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

type LoginMethod = 'email' | 'phone';

interface FormData {
  email?: string;
  phone?: string;
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

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore.getState();
  const [error, setError] = useState('');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    phone: '',
    password: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Your login API call here
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          // ... your fetch options
        }
      );
      const data = await response.json();
      // Set auth state
      setAuth({
        token: data.token,
        role: data.user.role,
        user: {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
        },
      });

      // Log the state after setting
      const currentState = useAuthStore.getState();
      console.log('Current auth state:', currentState);

      // Add a small delay before redirect
      setTimeout(() => {
        router.push('/');
      }, 100);
    } catch (error) {
      console.error('Login error:', error);
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
          <div className='flex justify-center space-x-4 mb-6'>
            <Button
              type='button'
              variant={loginMethod === 'email' ? 'default' : 'outline'}
              onClick={() => setLoginMethod('email')}
            >
              Email
            </Button>
            <Button
              type='button'
              variant={loginMethod === 'phone' ? 'default' : 'outline'}
              onClick={() => setLoginMethod('phone')}
            >
              Teléfono
            </Button>
          </div>

          <form
            className='space-y-4'
            onSubmit={handleLogin}
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
                  id='phone'
                  type='tel'
                  placeholder='Teléfono (ej: +34612345678)'
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  disabled={loading}
                />
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
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Iniciando sesión...
                </>
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
