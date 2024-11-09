'use client';
import { Button } from '@/components/ui/button';
import { MouseEvent } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Junta } from '@/types';
import { DollarSignIcon, UserIcon } from 'lucide-react';

export function JuntaCard({
  junta,
  onSelectJunta,
  onDeleteJunta,
}: {
  junta: Junta;
  onSelectJunta: (junta: Junta) => void;
  onDeleteJunta: (id: string, e: React.MouseEvent) => void;
}) {
  console.log(
    'junta: ',
    junta,
    'junta card',
    junta.available_capital,
    'junta id',
    junta.id
  );
  const totalSavings = junta.available_capital;
  // const progress = (junta.current_month / junta.duration_months) * 100;
  const socios = junta.members.filter((m) => m.user.role === 'USER');
  console.log(' junta.members: ', junta.members);
  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>{junta.name}</CardTitle>
        <CardDescription>
          {/* Duración: {junta.duration_months} meses */}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <span className='flex items-center'>
              Capital Social: S/.{junta.available_capital}
            </span>
            <span className='flex items-center'>
              <UserIcon className='mr-2 h-4 w-4' />
              {socios.length} socios
            </span>
          </div>
          {/* <Progress
            value={progress}
            className='w-full'
          /> */}
          {/* <p>
            Mes actual: {junta.current_month} de {junta.duration_months}
          </p> */}
        </div>
      </CardContent>
      <CardFooter className='flex justify-between'>
        <Button
          onClick={() => onSelectJunta(junta)}
          className='flex-1 mr-2'
        >
          Ver detalles
        </Button>
        <Button
          variant='destructive'
          onClick={(e) => onDeleteJunta(junta.id, e)}
          className='flex-1 ml-2'
        >
          Eliminar
        </Button>
      </CardFooter>
    </Card>
  );
}
