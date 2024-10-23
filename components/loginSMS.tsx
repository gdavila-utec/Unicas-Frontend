import React, { useState } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Loader2, Phone } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const PhoneSignUp = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, isLoaded: clerkLoaded } = useSignUp();
  const router = useRouter();

  // Format phone number as user types (9 digits for Peru)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 9) value = value.slice(0, 9); // Limit to 9 digits
    
    // Format as XXX XXX XXX
    if (value.length > 0) {
      if (value.length <= 3) value = value;
      else if (value.length <= 6) 
        value = value.slice(0, 3) + ' ' + value.slice(3);
      else
        value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6);
    }
    setPhoneNumber(value);
  };

  const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clerkLoaded) return;

    setLoading(true);
    setError('');

    try {
      // Add +51 prefix and remove spaces
      const formattedPhone = `+51${phoneNumber.replace(/\s/g, '')}`;

      const result = await signUp.create({
        phoneNumber: formattedPhone
      });

      // Request phone verification code
      await signUp.preparePhoneNumberVerification();
      setPendingVerification(true);
    } catch (err: any) {
      console.error("Phone sign-up error:", err);
      setError(err.errors?.[0]?.message || "Error al registrar el número");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clerkLoaded || !signUp) return;

    setLoading(true);
    setError('');

    try {
      const result = await signUp.attemptPhoneNumberVerification({
        code: verificationCode
      });

      if (result.status === "complete") {
        router.push('/');
        router.refresh();
      } else {
        setError("Error en la verificación");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.errors?.[0]?.message || "Error al verificar el código");
    } finally {
      setLoading(false);
    }
  };

  // Handle resend verification code
  const handleResendCode = async () => {
    if (!clerkLoaded || !signUp) return;

    setLoading(true);
    setError('');

    try {
      await signUp.preparePhoneNumberVerification();
      // Show success message
      setError("Nuevo código enviado");
    } catch (err: any) {
      console.error("Resend error:", err);
      setError(err.errors?.[0]?.message || "Error al reenviar el código");
    } finally {
      setLoading(false);
    }
  };

  if (!clerkLoaded) {
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
          {pendingVerification ? 'Verificar Número' : 'Registrarse con Teléfono'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant={error === "Nuevo código enviado" ? "default" : "destructive"} className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!pendingVerification ? (
          <form onSubmit={handleSubmitPhone} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Número de Teléfono</Label>
              <div className="flex gap-2 items-center">
                <div className="bg-muted px-3 py-2 rounded-md text-muted-foreground">
                  +51
                </div>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="999 999 999"
                  required
                  className="w-full"
                  maxLength={11} // Accounts for spaces
                />
              </div>
              <p className="text-sm text-gray-500">
                Ingresa tu número de 9 dígitos
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || phoneNumber.replace(/\s/g, '').length !== 9}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando código...
                </>
              ) : (
                <>
                  <Phone className="mr-2 h-4 w-4" />
                  Recibir código por SMS
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código de Verificación</Label>
              <Input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setVerificationCode(value.slice(0, 6));
                }}
                placeholder="000000"
                required
                className="w-full text-center text-2xl tracking-widest"
                maxLength={6}
              />
              <p className="text-sm text-gray-500 text-center">
                Te enviamos un código de 6 dígitos al<br />
                +51 {phoneNumber}
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || verificationCode.length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar Código'
              )}
            </Button>

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleResendCode}
                disabled={loading}
              >
                Reenviar código
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setPendingVerification(false)}
                disabled={loading}
              >
                Cambiar número de teléfono
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default PhoneSignUp;