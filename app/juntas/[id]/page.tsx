'use client';
import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useJuntaDashboard } from '@/hooks/useJuntaDashboard';
import ResumenSection from '@/components/ResumenSection';
import MembersSection from '@/components/MembersSection';
import PrestamosSection from '@/components/PrestamosSection';
import MultaSection from '@/components/MultasSection';
import AcccionesSection from '@/components/AccionesSection';
import PagosSection from '@/components/PagosSection';
import { Ajustes } from '@/components/Ajustes';
import { AsistenciaSection } from '@/components/Asistencia';
import { MenuItems } from '@/components/MenuItems'

const UNICAVecinalDashboard = ({ params }: { params: { id: string } }) => {
  const [isClient, setIsClient] = useState(false);
  const menuItems = MenuItems(params.id)
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { junta, members, isLoading, isError, availableCapital, refetch } =
    useJuntaDashboard(params.id);
  
  useEffect(() => {
    console.log('refetching params.id: ', params.id);
    refetch();
  }, [params.id]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/sign-in');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;



  return (
    <div className='container mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen'>
      <Card className='mb-6 shadow-lg'>
        <CardHeader className='bg-primary text-primary-foreground h-20'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-2xl sm:text-3xl font-bold flex gap-4'>
              {isLoading ? (
                <Skeleton className='h-8 w-2/3 mb-4' />
              ) : (
                <div className='text-xl font-semibold mb-4'>
                  {junta ? junta.name : 'No junta encontrada'}
                </div>
              )}
            </CardTitle>
            <Link href='/'></Link>
            <Link href='/'>
              <Button
                variant='secondary'
                size='sm'
                className='hidden sm:flex items-center gap-2 rounded bg-gray-800 text-primary-foreground'
              >
                {/* <ChevronLeft className='w-4 h-4' /> */}
                Cerrar sesion
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className='pt-6 flex '>
          <Tabs
            defaultValue='Resumen'
            className='w-full flex h-screen '
          >
            <TabsList className='flex flex-col h-full justify-start gap-1'>
              {menuItems.map((item) => (
                <TabsTrigger
                  key={item.label}
                  value={item.label}
                  className={item.color}
                >
                  <item.icon className='mr-2 h-4 w-4' />
                  <span className='hidden xl:inline'>{item.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <Card className='bg-white shadow-sm'>
              <CardContent className='p-4 sm:p-6'>
                <TabsContent value='Resumen'>
                  <ResumenSection
                    juntaId={params.id}
                    menuItems={menuItems}
                  />
                </TabsContent>
                <TabsContent value='Socios'>
                  <MembersSection juntaId={params.id} />
                </TabsContent>
                <TabsContent value='Asistencia'>
                  <AsistenciaSection juntaId={params.id} />
                </TabsContent>
                <TabsContent value='multas'>
                  <MultaSection juntaId={params.id} />
                </TabsContent>
                <TabsContent value='acciones'>
                  <AcccionesSection juntaId={params.id} />
                </TabsContent>
                <TabsContent value='pagos'>
                  <PagosSection juntaId={params.id} />
                </TabsContent>
                <TabsContent value='config'>
                  <Ajustes />
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UNICAVecinalDashboard;
