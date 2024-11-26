'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { AddJuntaComponent } from '../components/AddJuntaAltComponent';
import GestionUsuarios from '../components/GestionUsuarios';
import { LoadingSection } from '../components/LoadingFallback';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { useJuntasDashboard } from '../hooks/useJuntasDashboard';
import { JuntaCard } from '@/components/JuntaCard';
import { useRouter } from 'next/navigation';
import { Junta } from '../types';
import { LogoutButton } from '@/components/LogoutButton';

export default function Home() {
  const router = useRouter();
  const {
    state: { juntas, isLoading, error, isRefetching, adminUsers },
    actions: {
      handleRefetch,
      setAdminUsers,
      handleDelete,
    },
    dialog: { isOpen, openCreate, close },
    isAuthenticated,
  } = useJuntasDashboard();

  const handleSelectJunta = (junta: Junta) => {
    router.push(`/juntas/${junta.id}`);
  };

  if (!isAuthenticated) return null;

  return (
    <main className='container mx-auto p-4 sm:p-6 min-h-screen bg-gray-50'>
      <div className='flex flex-col gap-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl sm:text-3xl font-bold'>
            UNICA Vecinal Dashboard
          </h1>
          <div className='flex items-center gap-2 h-10'>
            <Button
              variant='outline'
              className='mt-0 mr-2 bg-black text-white'
              size='sm'
              onClick={() => openCreate(handleRefetch)}
            >
              Crear nueva junta
            </Button>
            <Button
              variant='outline'
              className='mt-0 bg-black text-white'
              size='sm'
              onClick={() => setAdminUsers(false)}
            >
              Gestionar Juntas
            </Button>
            <Button
              variant='outline'
              className='mt-0 bg-black text-white'
              size='sm'
              onClick={() => setAdminUsers(true)}
            >
              Gestionar usuarios
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='bg-black text-white'
              onClick={handleRefetch}
              disabled={isLoading || isRefetching}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`}
              />
              Actualizar
            </Button>
            <div className='flex w-28  justify-center'>
              {' '}
              <LogoutButton />
            </div>

            <AddJuntaComponent
              open={isOpen}
              onOpenChange={(open) =>
                open ? openCreate(handleRefetch) : close()
              }
              onJuntaAdded={handleRefetch}
            />
          </div>
        </div>

        {isLoading ? (
          <LoadingSection
            title='Cargando juntas'
            message='Por favor espere mientras cargamos las juntas'
          />
        ) : error ? (
          <ErrorDisplay
            title='Error al cargar las juntas'
            message={error.message}
            onRetry={handleRefetch}
          />
        ) : adminUsers ? (
          <GestionUsuarios />
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {juntas.length > 0 ? (
              juntas.map((junta) => (
                <JuntaCard
                  key={junta.id}
                  junta={junta}
                  onSelectJunta={() => handleSelectJunta(junta)}
                  onDeleteJunta={handleDelete}
                />
              ))
            ) : (
              <div className='col-span-full text-center py-8'>
                <p className='text-muted-foreground'>
                  No hay juntas disponibles
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
