// app/juntas/[id]/layout.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useJuntaDashboard } from '@/hooks/useJuntaDashboard';
import { MenuItems } from '@/components/MenuItems';
import { Settings } from 'lucide-react';

export default function JuntaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);
  const params = useParams();
  const menuItems = MenuItems(params.id as string);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const { junta, isLoading, refetch } = useJuntaDashboard(params.id as string);

  useEffect(() => {
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
            <div className='flex gap-3'>
              <Button
                variant='secondary'
                size='sm'
                className='hidden sm:flex items-center gap-2 rounded bg-gray-800 text-primary-foreground'
                onClick={() => router.push(`/juntas/${params.id}/settings`)}
              >
                <Settings />
                Ajustes
              </Button>
              <Link href='/'>
                <Button
                  variant='secondary'
                  size='sm'
                  className='hidden sm:flex items-center gap-2 rounded bg-gray-800 text-primary-foreground'
                >
                  Cerrar sesion
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className='pt-6 flex'>
          {/* Navigation Menu */}
          <div className='flex flex-col gap-1'>
            {menuItems.map((item) => (
              <Button
                key={item.label}
                variant='ghost'
                className={item.color}
                onClick={() =>
                  router.push(`/juntas/${params.id}/${item.route}`)
                }
              >
                <item.icon className='mr-2 h-4 w-4' />
                <span className='hidden xl:inline'>{item.label}</span>
              </Button>
            ))}
          </div>

          {/* Content Area */}
          <Card className='bg-white shadow-sm flex-1 ml-4'>
            <CardContent className='p-4 sm:p-6'>{children}</CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}


