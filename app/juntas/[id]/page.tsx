'use client';
import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Home,
  User,
  DollarSign,
  AlertTriangle,
  PiggyBank,
  CreditCard,
  Settings,
  DollarSignIcon,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useJuntaDashboard } from '@/hooks/useJuntaDashboard';
import ResumenSection from '@/components/ResumenSection';
import MemberSection from '@/components/MemberSection';
import PrestamosSection from '@/components/PrestamosSection';
import MultaSection from '@/components/MultasSection';
import AcccionesSection from '@/components/AccionesSection';
import PagosSection from '@/components/PagosSection';
import { Ajustes } from '@/components/Ajustes';

const UNICAVecinalDashboard = ({ params }: { params: { id: string } }) => {
  const [isClient, setIsClient] = useState(false);
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

  const tabItems = [
    { value: 'resumen', label: 'Resumen', icon: Home },
    { value: 'socios', label: 'Socios', icon: User },
    { value: 'prestamos', label: 'Préstamos', icon: DollarSignIcon },
    { value: 'multas', label: 'Multas', icon: AlertTriangle },
    {
      value: 'acciones',
      label: 'Acciones',
      icon: PiggyBank,
    },
    { value: 'pagos', label: 'Pagos', icon: CreditCard },
    { value: 'config', label: '', icon: Settings },
  ];

  return (
    <div className='container mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen'>
      <Card className='mb-6 shadow-lg'>
        <CardHeader className='bg-primary text-primary-foreground'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-2xl sm:text-3xl font-bold flex gap-4'>
              {isLoading ? (
                <Skeleton className='h-8 w-2/3 mb-4' />
              ) : (
                <h2 className='text-xl font-semibold mb-4'>
                  {junta ? junta.name : 'No junta encontrada'}
                </h2>
              )}
              {/* <span className=''>UNICA Vecinal Dashboard</span> */}
              {/* <span className=' sm:text-base font-normal  text-sm font-bold bg-white text-gray-900 px-4 py-2  rounded ml-40'>
                {availableCapital
                  ? 'S/.' + availableCapital.toFixed(2)
                  : 'S/. 0.00 '}
              </span> */}
            </CardTitle>
            <Link href='/'>
              {/* <Button
                variant='secondary'
                size='sm'
                className='hidden sm:flex items-center gap-2 rounded-md'
              >
                Capital Total:{' '}
                {availableCapital
                  ? 'S/.' + availableCapital.toFixed(2)
                  : 'S/. 0.00 '}
              </Button> */}
            </Link>
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
        <CardContent className='pt-6'>
          <Tabs
            defaultValue='resumen'
            className='w-full'
          >
            {/* <TabsList className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-6'>
              {tabItems.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className='flex items-center gap-2'
                >
                  <item.icon className='w-4 h-4' />
                  <span className='hidden sm:inline'>{item.label}</span>
                </TabsTrigger>
              ))}
            </TabsList> */}

            <Card className='bg-white shadow-sm'>
              <CardContent className='p-4 sm:p-6'>
                <TabsContent value='resumen'>
                  <ResumenSection juntaId={params.id} />
                </TabsContent>
                <TabsContent value='socios'>
                  {/* <MemberSection juntaId={params.id, } /> */}
                </TabsContent>
                <TabsContent value='prestamos'>
                  <PrestamosSection juntaId={params.id} />
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
