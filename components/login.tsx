import React, { useState } from 'react';
import { useSignIn, useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EmailAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'credentials' | 'verification'>(
    'credentials'
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signup' | 'signin'>('signin');

  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const router = useRouter();

  const isLoaded = signInLoaded && signUpLoaded;

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      if (mode === 'signin') {
        const signInAttempt = await signIn.create({
          identifier: email,
          password,
        });

        if (signInAttempt.status === 'complete') {
          router.push('/');
          router.refresh();
          return;
        }

        // If 2FA is required, proceed to verification
        if (signInAttempt.status === 'needs_second_factor') {
          setStep('verification');
          return;
        }

        // If password is incorrect, try email code
        const firstFactor = signInAttempt.supportedFirstFactors?.find(
          (factor) => factor.strategy === 'email_code'
        );

        if (firstFactor) {
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: firstFactor.emailAddressId as string,
          });
          setStep('verification');
        }
      } else {
        if (password !== confirmPassword) {
          setError('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }

        if (password.length < 8) {
          setError('La contraseña debe tener al menos 8 caracteres');
          setLoading(false);
          return;
        }

        // Initialize sign up
        const result = await signUp.create({
          emailAddress: email,
          password,
        });

        setStep('verification');
        // Prepare verification
        // const verificationResponse = await signUp.prepareEmailAddressVerification();
        // if (verificationResponse.verificationFlow) {
        //   setStep('verification');
        // }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.errors && err.errors.length > 0) {
        setError(err.errors[0].message);
      } else {
        setError('Error al procesar la solicitud');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      if (mode === 'signin') {
        const result = await signIn.attemptFirstFactor({
          strategy: 'email_code',
          code,
        });

        if (result.status === 'complete') {
          router.push('/');
          router.refresh();
        }
      } else {
        const result = await signUp.attemptEmailAddressVerification({
          code,
        });

        setStep('credentials');
        setMode('signin');

        if (result.status === 'complete') {
          router.push('/');
          router.refresh();
        }
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      if (err.errors && err.errors.length > 0) {
        setError(err.errors[0].message);
      } else {
        setError('Error al verificar el código');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError('');
    setMode('signin');

    try {
      if (mode === 'signin') {
        const signInAttempt = await signIn.create({
          identifier: email,
        });

        const firstFactor = signInAttempt.supportedFirstFactors?.find(
          (factor) => factor.strategy === 'email_code'
        );

        if (firstFactor) {
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: firstFactor.emailAddressId as string,
          });
        }
      } else {
        await signUp.create({
          emailAddress: email,
          password,
        });
      }
      setError('Código reenviado');
    } catch (err: any) {
      console.error('Resend error:', err);
      if (err.errors && err.errors.length > 0) {
        setError(err.errors[0].message);
      } else {
        setError('Error al reenviar el código');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className='flex justify-center items-center min-h-[200px]'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle className='text-2xl font-bold text-center'>
          {step === 'credentials' ? 'Acceder con Email' : 'Verificar Email'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === 'credentials' ? (
          <>
            <Tabs
              value={mode}
              onValueChange={(value) => {
                setMode(value as 'signup' | 'signin');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setError('');
              }}
              className='mb-4'
            >
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='signin'>Iniciar Sesión</TabsTrigger>
                <TabsTrigger value='signup'>Registrarse</TabsTrigger>
              </TabsList>
            </Tabs>

            {error && (
              <Alert
                variant='destructive'
                className='mb-4'
              >
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form
              onSubmit={handleCredentialsSubmit}
              className='space-y-4'
            >
              <div className='space-y-2'>
                <Label htmlFor='email'>Correo Electrónico</Label>
                <Input
                  id='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='tucorreo@ejemplo.com'
                  required
                  className='w-full'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password'>Contraseña</Label>
                <Input
                  id='password'
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='••••••••'
                  required
                  minLength={8}
                  className='w-full'
                />
                {mode === 'signup' && (
                  <p className='text-sm text-gray-500'>
                    La contraseña debe tener al menos 8 caracteres
                  </p>
                )}
              </div>

              {mode === 'signup' && (
                <div className='space-y-2'>
                  <Label htmlFor='confirmPassword'>Confirmar Contraseña</Label>
                  <Input
                    id='confirmPassword'
                    type='password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='••••••••'
                    required
                    minLength={8}
                    className='w-full'
                  />
                </div>
              )}

              <Button
                type='submit'
                className='w-full'
                disabled={
                  loading ||
                  !email ||
                  !password ||
                  (mode === 'signup' && !confirmPassword)
                }
              >
                {loading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    {mode === 'signin'
                      ? 'Iniciando sesión...'
                      : 'Registrando...'}
                  </>
                ) : (
                  <>
                    <Lock className='mr-2 h-4 w-4' />
                    {mode === 'signin' ? 'Iniciar Sesión' : 'Registrarse'}
                  </>
                )}
              </Button>
            </form>
          </>
        ) : (
          <form
            onSubmit={handleVerifyCode}
            className='space-y-4'
          >
            {error && (
              <Alert
                variant={
                  error === 'Código reenviado' ? 'default' : 'destructive'
                }
                className='mb-4'
              >
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className='space-y-2'>
              <Label htmlFor='code'>Código de Verificación</Label>
              <Input
                id='code'
                type='text'
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setCode(value.slice(0, 6));
                }}
                placeholder='000000'
                required
                className='w-full text-center text-2xl tracking-widest'
                maxLength={6}
              />
              <p className='text-sm text-gray-500 text-center'>
                Te enviamos un código de 6 dígitos al
                <br />
                {email}
              </p>
            </div>

            <Button
              type='submit'
              className='w-full'
              disabled={loading || code.length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Verificando...
                </>
              ) : (
                'Verificar Código'
              )}
            </Button>

            <div className='flex flex-col gap-2'>
              <Button
                type='button'
                variant='ghost'
                className='w-full'
                onClick={handleResendCode}
                disabled={loading}
              >
                Reenviar código
              </Button>

              <Button
                type='button'
                variant='ghost'
                className='w-full'
                onClick={() => {
                  setStep('credentials');
                  setCode('');
                }}
                disabled={loading}
              >
                Cambiar email
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailAuth;
