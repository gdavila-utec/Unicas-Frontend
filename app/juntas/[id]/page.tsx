'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Home,
  User,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  Briefcase,
  Calendar,
  ChevronsLeftRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import ResumenSection from '@/components/ResumenSection';
import MemberSection from '@/components/MemberSection';
import PrestamosSection from '@/components/PrestamosSection';
import MultaSection from '@/components/MultasSection';
import AcccionesSection from '@/components/AccionesSection';
import PagosSection from '@/components/PagosSection';
// import CapitalSocialSection from '@/components/CapitalSocialSection';
import AgendaSection from '@/components/AgendaSection';
import { Ajustes } from '@/components/Ajustes';

const UNICAVecinalDashboard = ({ params }: { params: { id: string } }) => {
  const [isClient, setIsClient] = useState(false);
  const [junta, setJunta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, isAdmin, token } = useAuth();
  const router = useRouter();

  const handleGetJunta = async () => {
    if (!isAdmin || !isAuthenticated) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/juntas/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 401) {
        // Redirect to sign-in if unauthorized
        router.push('/sign-in');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch junta');
      }

      const data = await response.json();
      setJunta(data);
    } catch (error) {
      console.error('Error fetching junta:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/sign-in');
      return;
    }

    if (isAuthenticated) {
      handleGetJunta();
    }
  }, [isAuthenticated, params.id]);

  if (!isAuthenticated) return null;

  const tabItems = [
    { value: 'resumen', label: 'Resumen', icon: Home },
    { value: 'socios', label: 'Socios', icon: User },
    { value: 'prestamos', label: 'Préstamos', icon: DollarSign },
    { value: 'multas', label: 'Multas', icon: AlertTriangle },
    { value: 'acciones', label: 'Acciones', icon: TrendingUp },
    { value: 'pagos', label: 'Pagos', icon: CreditCard },

    { value: 'agenda', label: 'Agenda', icon: Calendar },
    { value: 'config', label: 'Configuración', icon: ChevronsLeftRight },
  ];

  return (
    <div className='container mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen'>
      <Card className='mb-6 shadow-lg'>
        <CardHeader className='bg-primary text-primary-foreground'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-2xl sm:text-3xl font-bold'>
              UNICA Vecinal Dashboard
            </CardTitle>
            <Link href='/'>
              <Button
                variant='secondary'
                size='sm'
                className='hidden sm:flex items-center gap-2'
              >
                <ChevronLeft className='w-4 h-4' />
                Todas las juntas
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className='pt-6'>
          {isLoading ? (
            <Skeleton className='h-8 w-2/3 mb-4' />
          ) : (
            <h2 className='text-xl font-semibold mb-4'>
              {junta ? junta.name : 'No junta encontrada'}
            </h2>
          )}
          <Tabs
            defaultValue='resumen'
            className='w-full'
          >
            <TabsList className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-6'>
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
            </TabsList>
            <Card className='bg-white shadow-sm'>
              <CardContent className='p-4 sm:p-6'>
                <TabsContent value='resumen'>
                  <ResumenSection juntaId={params.id} />
                </TabsContent>
                <TabsContent value='socios'>
                  <MemberSection juntaId={params.id} />
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
                {/* <TabsContent value='capital'>
                  <CapitalSocialSection juntaId={params.id} />
                </TabsContent> */}
                <TabsContent value='agenda'>
                  <AgendaSection juntaId={params.id} />
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
