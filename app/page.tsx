'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '../hooks/use-toast';
import axiosInstance from '../utils/axios';
import useAuthStore from '../store/useAuthStore';
import { AddJuntaComponent } from '../components/AddJuntaAltComponent';
import GestionUsuarios from '../components/GestionUsuarios';
import { useJuntaDialog } from '../hooks/useJuntaDialog';
import { useJuntaStore } from '@/store/juntaValues';
import { LoadingSection } from '../components/LoadingFallback';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { usePrefetch } from '@/hooks/usePrefetch';
import type { Junta } from '../types';

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();
  const { isOpen, openCreate, close } = useJuntaDialog();
  const [adminUsers, setAdminUsers] = useState<boolean>(false);
  const { setJuntas } = useJuntaStore();

  const {
    data: juntas,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['juntas'],
    queryFn: async () => {
      try {
        // Use axiosInstance directly to maintain interceptor functionality
        const response = await axiosInstance.get('/juntas');

        console.log('Raw API Response:', response);

        // Check for empty response
        if (!response?.data) {
          throw new Error('No se recibieron datos del servidor');
        }

        // Handle nested data structure
        let juntasData = response.data;
        if (response.data.data) {
          juntasData = response.data.data;
        }

        // Validate and transform the data
        if (!Array.isArray(juntasData)) {
          throw new Error('Formato de respuesta inválido');
        }

        // Filter out empty or invalid objects
        const validJuntas = juntasData.filter(
          (junta) =>
            junta &&
            typeof junta === 'object' &&
            'id' in junta &&
            'name' in junta
        );

        console.log('Processed juntas:', validJuntas);

        if (validJuntas.length === 0) {
          console.warn('No valid juntas found in response:', juntasData);
          return [];
        }

        setJuntas(validJuntas);

        return validJuntas;
      } catch (error: any) {
        console.error('Error fetching juntas:', {
          error,
          response: error.response,
          data: error.response?.data,
        });

        // Handle specific error cases
        if (error.response?.status === 401) {
          router.push('/sign-in');
          throw new Error(
            'Sesión expirada. Por favor, inicie sesión nuevamente.'
          );
        }

        throw new Error(
          error.response?.data?.message ||
            'Error al cargar las juntas. Por favor, intente de nuevo.'
        );
      }
    },
    retry: false, // Disable retries since we're handling errors explicitly
    staleTime: 6000,
  });

  const handleRefetch = async () => {
    try {
      const result = await refetch();
      if (result.data && result.data.length > 0) {
        toast({
          title: 'Actualizado',
          description: 'Los datos han sido actualizados correctamente.',
        });
      } else {
        toast({
          title: 'Sin datos',
          description: 'No se encontraron juntas para mostrar.',
        });
      }
    } catch (error) {
      console.error('Refetch error:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Error al actualizar los datos',
        variant: 'destructive',
      });
    }
  };

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/sign-in');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <main className='container mx-auto p-4 sm:p-6 min-h-screen bg-gray-50'>
      <div className='flex flex-col gap-6 '>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl sm:text-3xl font-bold'>
            UNICA Vecinal Dashboard
          </h1>
          <div className='flex items-center gap-2 h-10 '>
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
            message={(error as Error).message}
            onRetry={handleRefetch}
          />
        ) : adminUsers ? (
          <GestionUsuarios />
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {Array.isArray(juntas) && juntas.length > 0 ? (
              juntas.map((junta) => (
                <Card
                  key={junta.id}
                  className='cursor-pointer hover:shadow-lg transition-shadow'
                  onClick={() => router.push(`/juntas/${junta.id}`)}
                >
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-lg font-bold'>
                      {junta.name}
                    </CardTitle>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/juntas/${junta.id}/edit`);
                        }}
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle delete (implementation omitted for brevity)
                        }}
                      >
                        <Trash2 className='h-4 w-4 text-destructive' />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='text-sm text-muted-foreground'>
                      <p>{junta.centro_poblado}</p>
                      <p>
                        {junta.distrito}, {junta.provincia}
                      </p>
                      <p className='mt-2'>
                        Capital: S/.
                        {junta.available_capital?.toLocaleString('es-PE', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) ?? '0.00'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
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
