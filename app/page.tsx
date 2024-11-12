'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { AddJuntaComponent } from '../components/AddJuntaAltComponent';
import GestionUsuarios from '../components/GestionUsuarios';
import { LoadingSection } from '../components/LoadingFallback';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { useJuntasDashboard } from '../hooks/useJuntasDashboard';
import { JuntaCard } from '@/components/JuntaCard';
import { useRouter } from 'next/navigation';
import { api } from '../utils/api';
import { Junta } from '../types';

export default function Home() {
  const [deleteJuntaId, setDeleteJuntaId] = useState<string | null>(null);
  const [juntasState, setJuntasState] = useState<Junta[]>([]);
  const router = useRouter();
  const {
    state: { juntas, isLoading, error, isRefetching, adminUsers },
    actions: {
      handleRefetch,
      setAdminUsers,
      navigateToJunta,
      navigateToEdit,
      handleDelete,
    },
    dialog: { isOpen, openCreate, close },
    isAuthenticated,
  } = useJuntasDashboard();

  const handleSelectJunta = (junta: Junta) => {
    router.push(`/juntas/${junta.id}`);
  };

  const handleDeleteJunta = async (juntaId: string) => {
    try {
      const response = await api.delete(`juntas/${juntaId}`);
      console.log('response: ', response);
      if (!response.ok) throw new Error('Failed to delete junta');
      handleRefetch();
      // setJuntasState(juntas.filter((j) => j.id.toString() !== juntaId));
    } catch (error) {
      console.error('Failed to delete junta:', error);
    } finally {
      // setDeleteJuntaId(null);
    }
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
                // <Card
                //   key={junta.id}
                //   className='cursor-pointer hover:shadow-lg transition-shadow'
                //   onClick={() => navigateToJunta(junta.id)}
                // >
                //   <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                //     <CardTitle className='text-lg font-bold'>
                //       {junta.name}
                //     </CardTitle>
                //     <div className='flex items-center gap-2'>
                //       <Button
                //         variant='ghost'
                //         size='icon'
                //         onClick={(e) => navigateToEdit(junta.id, e)}
                //       >
                //         <Edit className='h-4 w-4' />
                //       </Button>
                //       <Button
                //         variant='ghost'
                //         size='icon'
                //         onClick={(e) => handleDelete(junta.id, e)}
                //       >
                //         <Trash2 className='h-4 w-4 text-destructive' />
                //       </Button>
                //     </div>
                //   </CardHeader>
                //   <CardContent>
                //     <div className='text-sm text-muted-foreground'>
                //       <p>{junta.centro_poblado}</p>
                //       <p>
                //         {junta.distrito}, {junta.provincia}
                //       </p>
                //       <p className='mt-2'>
                //         Capital: S/.
                //         {junta.available_capital?.toLocaleString('es-PE', {
                //           minimumFractionDigits: 2,
                //           maximumFractionDigits: 2,
                //         }) ?? '0.00'}
                //       </p>
                //     </div>
                //   </CardContent>
                // </Card>
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
