import React, { useState } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const CreatePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp, isLoaded } = useSignUp();
  const router = useRouter();

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "La contraseña debe tener al menos 8 caracteres";
    if (!/[A-Z]/.test(pass)) return "La contraseña debe contener al menos una mayúscula";
    if (!/[a-z]/.test(pass)) return "La contraseña debe contener al menos una minúscula";
    if (!/[0-9]/.test(pass)) return "La contraseña debe contener al menos un número";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setError('');
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      const result = await signUp.update({
        password,
      });

      if (result.status === 'complete') {
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      console.error("Password creation error:", err);
      if (err.errors && err.errors.length > 0) {
        setError(err.errors[0].message);
      } else {
        setError("Error al crear la contraseña");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Crear Contraseña
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full"
            />
          </div>

          <div className="text-sm text-gray-500 space-y-1">
            <p>La contraseña debe contener:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Al menos 8 caracteres</li>
              <li>Al menos una letra mayúscula</li>
              <li>Al menos una letra minúscula</li>
              <li>Al menos un número</li>
            </ul>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !password || !confirmPassword}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando contraseña...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Crear Contraseña
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePassword;