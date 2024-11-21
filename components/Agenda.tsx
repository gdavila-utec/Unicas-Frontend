import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PiggyBank } from 'lucide-react';

export function AgendaInfo() {
  const capitalInfo = {
    total: 1502.0,
    reservaLegal: 1502.0,
    fondoSocial: 1602.0,
  };

  const agendaItems = [
    'Bienvenida',
    'Lectura del acta anterior',
    'Se toma la asistencia de los socios',
    'Se realiza el pago de multas',
    'Se revisa la Agenda de la asamblea',
    'Se realiza la compra de acciones',
    'Se realiza el pago de los prestamos',
    'Se realiza el registro de los prestamos',
    'Se realiza el cierre de acta y asamblea',
  ];

  return (
    <div className='space-y-6 max-w-3xl mx-auto p-6'>
      {/* Capital Info Card */}
      <Card className='bg-gray-50'>
        <CardContent className='pt-6'>
          <div className='flex justify-center mb-4'>
            <PiggyBank className='h-12 w-12' />
          </div>
          <div className='text-center space-y-2'>
            <div>Capital Total: S/{capitalInfo.total.toFixed(2)}</div>
            <div>Reserva Legal: S/{capitalInfo.reservaLegal.toFixed(2)}</div>
            <div>Fondo Social: S/{capitalInfo.fondoSocial.toFixed(2)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Agenda List Card */}
      <Card>
        <CardHeader>
          <CardTitle>Agenda de la Asamblea</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {agendaItems.map((item, index) => (
            <Card
              key={index}
              className='bg-white'
            >
              <CardContent className='p-4'>
                {index + 1}. {item}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className='flex justify-between pt-4'>
        <Button variant='outline'>Regresar</Button>
        <Button>Siguiente</Button>
      </div>
    </div>
  );
}
