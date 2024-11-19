'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { useSocioSection  } from '@/hooks/useSocio'

export default function SocioPage() {
  const params = useParams();
  const juntaId = params.id as string;
  const memberId = params.socioId as string;



  const {
    memberDetail,
    summary,
    acciones,
    prestamos,
    remainingPayments,
    isLoading,
    error,
  } = useSocioSection(juntaId, memberId);
  
  console.log("summary: ", summary);
  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900' />
      </div>
    );
  }

  return (
    <div className='container mx-auto p-4 space-y-6'>
      {/* Header Section */}
      <div className='grid grid-cols-3 gap-4'>
        {/* Member Info */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del Socio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-sm space-y-2'>
              <p className='font-medium'>{memberDetail?.full_name}</p>
              <p>DNI: {memberDetail?.document_number}</p>
              <p>Cargo: {memberDetail?.member_role}</p>
              <p>
                Fecha de Ingreso:{' '}
                {format(new Date(memberDetail?.join_date || ''), 'dd/MM/yyyy')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Shares Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>
                  Número de acciones
                </p>
                <p className='text-2xl font-bold'>{summary.acciones.count}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Valor total</p>
                <p className='text-2xl font-bold'>
                  S/. {summary.acciones.valor.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loans Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Préstamos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-muted-foreground'>
                  Monto solicitado
                </p>
                <p className='text-lg font-bold'>
                  S/. {summary.prestamos.prestamos.monto_solicitado}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Monto adeudado</p>
                <p className='text-lg font-bold'>
                  S/. {summary.prestamos.prestamos.monto_adeudado}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>
                  Cuotas pendientes
                </p>
                <p className='text-lg font-bold'>
                  {summary.prestamos.prestamos.cuotas_pendientes}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Próxima cuota</p>
                <p className='text-lg font-bold'>
                  S/. {summary.prestamos.prestamos.cuotas_pendientes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Información Adicional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-8'>
            <div>
              <h3 className='font-medium mb-2'>Actividad Productiva</h3>
              <p className='text-sm text-muted-foreground'>
                {memberDetail?.productive_activity}
              </p>
            </div>
            <div>
              <h3 className='font-medium mb-2'>Beneficiario</h3>
              <div className='space-y-1 text-sm text-muted-foreground'>
                <p>Nombre: {memberDetail?.beneficiary_full_name}</p>
                <p>DNI: {memberDetail?.beneficiary_document_number}</p>
                <p>Dirección: {memberDetail?.beneficiary_address}</p>
                <p>Teléfono: {memberDetail?.beneficiary_phone}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
