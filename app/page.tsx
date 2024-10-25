'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut } from 'lucide-react';
import {
  Protect,
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
  useUser,
} from '@clerk/nextjs';
import { AddJuntaComponent } from '@/components/AddJuntaComponent';
import { JuntaCard } from '@/components/JuntaCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Junta } from '@/types/junta';

// Types
type ViewType = 'member' | 'admin' | 'facilitador' | null;

// Components remain the same as before...
const LoadingSpinner = () => (
  <div className='flex justify-center items-center h-64'>
    <Loader2 className='h-12 w-12 animate-spin text-primary' />
  </div>
);

const EmptyJuntasMessage = () => (
  <Card className='shadow-md'>
    <CardContent className='p-6'>
      <p className='text-xl text-center text-gray-600'>
        No se encontraron juntas. ¡Agrega una para comenzar!
      </p>
    </CardContent>
  </Card>
);

const DeleteJuntaDialog = ({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => (
  <AlertDialog
    open={isOpen}
    onOpenChange={(open) => !open && onClose()}
  >
    <AlertDialogContent className='bg-white rounded-lg shadow-xl'>
      <AlertDialogHeader>
        <AlertDialogTitle className='text-2xl font-bold text-gray-800'>
          Eliminar Junta
        </AlertDialogTitle>
        <AlertDialogDescription className='text-gray-600'>
          Esta acción no se puede deshacer. Se eliminará permanentemente la
          junta y todos los datos asociados.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel className='bg-gray-200 text-gray-800 hover:bg-gray-300'>
          Cancelar
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className='bg-red-500 text-white hover:bg-red-600'
        >
          Eliminar
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const AdminView = ({
  juntas,
  loading,
  onSelectJunta,
  onDeleteJunta,
  onJuntaAdded,
}: {
  juntas: Junta[];
  loading: boolean;
  onSelectJunta: (junta: Junta) => void;
  onDeleteJunta: (juntaId: string) => void;
  onJuntaAdded: () => void;
}) => (
  <Protect>
    <div className='bg-gray-100 min-h-screen p-6'>
      <div className='container mx-auto'>
        <h1 className='text-4xl font-bold mb-8 text-center text-gray-800'>
          Gestión de UNICAS
        </h1>
        <AddJuntaComponent onJuntaAdded={onJuntaAdded} />
        {loading ? (
          <LoadingSpinner />
        ) : juntas.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {juntas.map((junta) => (
              <JuntaCard
                key={junta.id}
                junta={junta}
                onSelectJunta={() => onSelectJunta(junta)}
                onDeleteJunta={() => onDeleteJunta(junta.id.toString())}
              />
            ))}
          </div>
        ) : (
          <EmptyJuntasMessage />
        )}
      </div>
    </div>
  </Protect>
);

const Home: React.FC = () => {
  const [juntas, setJuntas] = useState<Junta[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteJuntaId, setDeleteJuntaId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>(null);

  const router = useRouter();
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (user?.publicMetadata.role === 'facilitador') {
      setActiveView('facilitador');
    } else if (user?.publicMetadata.role === 'admin') {
      setActiveView('admin');
    } else {
      setActiveView('member');
    }
  }, [user]);

  useEffect(() => {
    if (activeView === 'admin' || activeView === 'facilitador') {
      handleGetJuntas();
    }
  }, [activeView]);

  const handleGetJuntas = async () => {
    if (!isSignedIn) return;
    setLoading(true);
    try {
      const response = await fetch('/api/juntas');
      if (!response.ok) throw new Error('Failed to fetch juntas');
      const data = await response.json();
      setJuntas(data);
    } catch (error) {
      console.error('Failed to fetch juntas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJunta = async (juntaId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/juntas/${juntaId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to delete junta');
      setJuntas(juntas.filter((j) => j.id.toString() !== juntaId));
    } catch (error) {
      console.error('Failed to delete junta:', error);
    } finally {
      setDeleteJuntaId(null);
    }
  };

  return (
    <div className='min-h-screen w-full flex justify-center items-center bg-gray-50'>
      <div className='w-full sm:max-w-md p-6 md:max-w-6xl'>
        <Card className='shadow-lg'>
          <CardHeader className='text-center'>
            <CardTitle className='text-3xl font-bold'>
              Bienvenido/a a UNICAS
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {activeView === 'member' && (
              <div className='animate-in fade-in duration-300 space-y-4'>
                <SignedOut>
                  <Input
                    type='text'
                    placeholder='Ingrese su DNI'
                    className='w-full'
                  />
                  <Button className='w-full'>Ingresar</Button>
                </SignedOut>
                <SignedIn>
                  <p className='text-center text-gray-600'>
                    Bienvenido, miembro.
                  </p>
                  <SignOutButton>
                    <Button className='w-full flex items-center justify-center gap-2'>
                      <LogOut className='w-4 h-4' /> Cerrar sesión
                    </Button>
                  </SignOutButton>
                </SignedIn>
              </div>
            )}

            {activeView === 'admin' && (
              <div className='animate-in fade-in duration-300 space-y-4'>
                <SignedOut>
                  <SignInButton mode='modal'>
                    <Button className='w-full'>
                      Iniciar sesión como Admin
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <div className='flex items-center justify-between'>
                    <UserButton afterSignOutUrl='/' />
                    <SignOutButton>
                      <Button
                        variant='outline'
                        className='flex items-center gap-2'
                      >
                        <LogOut className='w-4 h-4' /> Cerrar sesión
                      </Button>
                    </SignOutButton>
                  </div>
                </SignedIn>
              </div>
            )}
          </CardContent>
        </Card>

        {activeView === 'admin' && (
          <AdminView
            juntas={juntas}
            loading={loading}
            onSelectJunta={(junta) => router.push(`/juntas/${junta.id}`)}
            onDeleteJunta={(juntaId) => setDeleteJuntaId(juntaId)}
            onJuntaAdded={handleGetJuntas}
          />
        )}
      </div>

      <DeleteJuntaDialog
        isOpen={!!deleteJuntaId}
        onClose={() => setDeleteJuntaId(null)}
        onConfirm={() => deleteJuntaId && handleDeleteJunta(deleteJuntaId)}
      />
    </div>
  );
};

export default Home;
