'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import AdminView from '@/components/AdminView';
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
import { Junta, ViewType, DeleteJuntaDialogProps } from '@/types/junta';
import useAuthStore from '@/store/useAuthStore';
import { useToast } from '@/hooks/use-toast';
import { AddJuntaComponent } from '@/components/AddJuntaAltComponent';
import GestionUsuarios from '@/components/GestionUsuarios';
import { api, handleApiError } from '@/utils/api';
import { useJuntaValues } from '@/store/juntaValues';

// Loading component
const LoadingSpinner = () => (
  <div className='h-screen w-full flex items-center justify-center'>
    <Loader2 className='h-8 w-8 animate-spin text-primary' />
  </div>
);

// Unauthorized component
const Unauthorized = () => (
  <div className='h-screen w-full flex flex-col items-center justify-center gap-4'>
    <h1 className='text-2xl font-bold text-red-600'>Acceso No Autorizado</h1>
    <p className='text-gray-600'>No tienes permisos para ver esta página.</p>
    <Button onClick={() => (window.location.href = '/sign-in')}>
      Volver al Inicio de Sesión
    </Button>
  </div>
);

const DeleteJuntaDialog: React.FC<DeleteJuntaDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
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
        <AlertDialogCancel
          className='bg-gray-200 text-gray-800 hover:bg-gray-300'
          disabled={isDeleting}
        >
          Cancelar
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className='bg-red-500 text-white hover:bg-red-600'
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Eliminando...
            </>
          ) : (
            'Eliminar'
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const Home: React.FC = () => {
  const { toast } = useToast();
  const [juntas, setJuntas] = useState<Junta[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeletingJunta, setIsDeletingJunta] = useState(false);
  const [deleteJuntaId, setDeleteJuntaId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>(null);
  const [view, setView] = useState<'crear-unica' | 'usuarios' | ''>('');
  const [isAddJuntaOpen, setIsAddJuntaOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { setJunta } = useJuntaValues();

  const { isAdmin, role, isAuthenticated, token, user } = useAuthStore();
  const router = useRouter();

  // Check authentication and role
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        router.replace('/sign-in');
        return;
      }

      if (!role) {
        useAuthStore.getState().clearAuth();
        router.replace('/sign-in');
        return;
      }

      setActiveView(role.toLowerCase() as ViewType);
      setIsInitializing(false);
    };

    checkAuth();
  }, [isAuthenticated, role, router]);

  const handleGetJuntas = useCallback(async () => {
    if (!isAuthenticated || !token || !isAdmin) return;

    try {
      const data = await api.get<Junta[]>('juntas');
      setJuntas(data);
    } catch (error) {
      const apiError = handleApiError(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: apiError.message,
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, isAdmin, toast]);

  // Fetch juntas when view is set to admin
  useEffect(() => {
    if (activeView === 'admin' || activeView === 'facilitador') {
      handleGetJuntas();
    } else {
      setLoading(false);
    }
  }, [activeView, handleGetJuntas]);

  const handleLogout = useCallback(() => {
    setView('');
    useAuthStore.getState().clearAuth();
    router.push('/sign-in');
  }, [router]);

  const handleDeleteJunta = useCallback(
    async (juntaId: string) => {
      if (!isAuthenticated || !token || !isAdmin) return;

      setIsDeletingJunta(true);
      try {
        await api.delete(`juntas/${juntaId}`);
        setJuntas((current) =>
          current.filter((j) => j.id.toString() !== juntaId)
        );
        toast({
          title: 'Éxito',
          description: 'Junta eliminada correctamente.',
        });
      } catch (error) {
        const apiError = handleApiError(error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: apiError.message,
        });
      } finally {
        setIsDeletingJunta(false);
        setDeleteJuntaId(null);
      }
    },
    [isAuthenticated, token, isAdmin, toast]
  );

  // Show loading state
  if (isInitializing) {
    return <LoadingSpinner />;
  }

  // Show unauthorized message if not admin
  if (!isAdmin && activeView !== 'member' && activeView !== 'user') {
    return <Unauthorized />;
  }

  return (
    <div className='min-h-full w-full max-h-full flex justify-center items-center bg-black'>
      <div className='w-full h-full sm:max-w-md p-2 md:max-w-6xl'>
        <Card className='shadow-lg rounded-t-md rounded-b-none p-0 bg-white p-4 border-none'>
          <CardContent className='space-y-4 rounded-none flex gap-5 justify-between items-center'>
            <CardTitle className='text-3xl font-bold mt-0'>
              Gestor de Juntas
            </CardTitle>
            {(activeView === 'member' || activeView === 'user') && (
              <div className='animate-in fade-in duration-300 space-y-0'>
                <p className='text-center'>Bienvenido {user?.name}</p>
                <Button
                  className='w-full flex items-center justify-center gap-2 bg-black text-white'
                  onClick={handleLogout}
                >
                  <LogOut className='w-4 h-4' /> Cerrar sesión
                </Button>
              </div>
            )}

            {isAdmin && (
              <div className='animate-in fade-in duration-300 space-y-0'>
                <div className='flex items-center justify-between gap-5'>
                  {/* <Button
                    variant='outline'
                    className={`flex items-center gap-2 ${
                      view === 'crear-unica'
                        ? 'bg-white text-black border-2 border-black'
                        : 'bg-black text-white'
                    }`}
                    onClick={() => setView('crear-unica')}
                  >
                    Agregar Junta
                  </Button> */}
                  <Button
                    variant='outline'
                    className={`flex items-center gap-2 ${
                      view === 'usuarios'
                        ? 'bg-white text-black border-2 border-black'
                        : 'bg-black text-white'
                    }`}
                    onClick={() => setView('usuarios')}
                  >
                    Gestionar Usuarios
                  </Button>
                  <Button
                    variant='outline'
                    className='flex items-center gap-2 bg-black text-white'
                    onClick={handleLogout}
                  >
                    <LogOut className='w-4 h-4' /> Cerrar sesión
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        {isAdmin && (
          <Card className='shadow-lg rounded-t-none p-4 border-none'>
            <CardContent>
              <Button
                onClick={() => setIsAddJuntaOpen(true)}
                className='w-full flex items-center justify-center gap-2 bg-black text-white mb-4'
              >
                <PlusCircle className='w-4 h-4' />
                Agregar Junta
              </Button>

              <AddJuntaComponent
                onJuntaAdded={handleGetJuntas}
                open={isAddJuntaOpen}
                onOpenChange={setIsAddJuntaOpen}
              />

              <AdminView
                juntas={juntas}
                loading={loading}
                onSelectJunta={(junta) => router.push(`/juntas/${junta.id}`)}
                onDeleteJunta={(juntaId) => setDeleteJuntaId(juntaId)}
                onJuntaAdded={handleGetJuntas}
              />
            </CardContent>
          </Card>
        )}
        {/* {isAdmin && (
          <Card className='shadow-lg rounded-t-none p-4 border-none'>
            <CardContent>
              {loading ? (
                <LoadingSpinner />
              ) : view === 'crear-unica' ? (
                <div className='animate-in fade-in duration-300'>
                  <Button
                    onClick={() => setIsAddJuntaOpen(true)}
                    className='w-full flex items-center justify-center gap-2 bg-black text-white mb-4'
                  >
                    <PlusCircle className='w-4 h-4' />
                    Agregar Junta
                  </Button>

                  <AddJuntaComponent
                    onJuntaAdded={handleGetJuntas}
                    open={isAddJuntaOpen}
                    onOpenChange={setIsAddJuntaOpen}
                  />
                </div>
              ) : view === 'usuarios' ? (
                <div className='animate-in fade-in duration-300'>
                  <GestionUsuarios />
                </div>
              ) : (
                <div></div>
              )}
              <AdminView
                juntas={juntas}
                loading={loading}
                onSelectJunta={(junta) => router.push(`/juntas/${junta.id}`)}
                onDeleteJunta={(juntaId) => setDeleteJuntaId(juntaId)}
                onJuntaAdded={handleGetJuntas}
              />
            </CardContent>
          </Card>
        )} */}
      </div>

      <DeleteJuntaDialog
        isOpen={!!deleteJuntaId}
        onClose={() => setDeleteJuntaId(null)}
        onConfirm={() => deleteJuntaId && handleDeleteJunta(deleteJuntaId)}
        isDeleting={isDeletingJunta}
      />
    </div>
  );
};

export default Home;
