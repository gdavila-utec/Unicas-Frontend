'use client';
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { JuntaCard } from '@/components/JuntaCard';
import GestionUsuarios from '@/components/GestionUsuarios';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Junta } from '@/types/junta';

const EmptyJuntasMessage = () => (
  <Card className='shadow-md'>
    <CardContent className='p-6'>
      <p className='text-xl text-center text-gray-600'>
        No se encontraron juntas. ¡Agrega una para comenzar!
      </p>
    </CardContent>
  </Card>
);

interface AdminViewProps {
  juntas: Junta[];
  loading: boolean;
  onSelectJunta: (junta: Junta) => void;
  onDeleteJunta: (id: string) => void;
  onJuntaAdded: () => void;
  description?: string;
  date?: string;
}

const AdminView: React.FC<AdminViewProps> = ({
  juntas,
  loading,
  onSelectJunta,
  onDeleteJunta,
  onJuntaAdded,
}) => (
  <div className=' min-h-screen p-4'>
    {/* <AddJuntaComponent onJuntaAdded={onJuntaAdded} /> */}
    <div className='container mx-auto '>
      <Tabs
        defaultValue='crear-unica'
        className='w-full'
      >
        {/* <TabsList className='grid w-full grid-cols-3 mb-10'>
          <TabsTrigger value='crear-unica'></TabsTrigger>
          <TabsTrigger value='usuarios'>
            <Button className='w-min bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg'>
              Usuarios
            </Button>
          </TabsTrigger>
          <TabsTrigger value='roles'>
            <Button className='w-min bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg'>
              Roles
            </Button>
          </TabsTrigger>
        </TabsList> */}

        <TabsContent
          value='crear-unica'
          className=''
        >
          <div className=''>
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
        </TabsContent>

        <TabsContent
          value='usuarios'
          className=''
        >
          <GestionUsuarios />
        </TabsContent>

        <TabsContent
          value='roles'
          className=''
        >
          <div className='rounded-lg bg-white shadow'>
            <h2 className='text-2xl font-semibold mb-4'>Gestión de Roles</h2>
            {/* Add your roles management content here */}
            <p className='text-gray-600'>
              Contenido de gestión de roles pendiente
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </div>
);

export default AdminView;
