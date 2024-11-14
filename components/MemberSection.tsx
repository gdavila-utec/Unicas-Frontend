// components/MemberSection.tsx
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMemberSection } from '@/hooks/useMemberSection';

interface MemberSectionProps {
  memberId: string;
  juntaId: string;
}

const MemberSection: React.FC<MemberSectionProps> = ({ memberId, juntaId }) => {
  const router = useRouter();
  const { memberDetail, summary, members, prestamos, isLoading } =
    useMemberSection(memberId, juntaId);

  if (isLoading || !memberDetail) {
    return (
      <div className='flex justify-center items-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900' />
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil del Socio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-sm text-gray-500'>Nombre</p>
              <p className='font-medium'>{memberDetail.user.full_name}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>DNI</p>
              <p className='font-medium'>{memberDetail.user.document_number}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Celular</p>
              <p className='font-medium'>{memberDetail.user.phone}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Cargo</p>
              <p className='font-medium'>{memberDetail.cargo}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Fecha de Ingreso</p>
              <p className='font-medium'>
                {new Date(memberDetail.fecha_ingreso).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Actividad Productiva</p>
              <p className='font-medium'>{memberDetail.actividad_productiva}</p>
            </div>
          </div>

          <Button
            variant='outline'
            className='mt-4'
            onClick={() => router.push(`/socios`)}
          >
            Ver toda la información
          </Button>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className='grid grid-cols-2 gap-6'>
        {/* Shares Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>{summary.acciones.count}</div>
            <p className='text-sm text-gray-500 mt-2'>
              Valor: S/. {summary.acciones.valor.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        {/* Active Loans Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Prestamos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <div className='text-sm text-gray-500'>Monto solicitado</div>
                <div className='text-lg font-semibold'>
                  S/. {summary.prestamos_activos.monto_solicitado.toFixed(2)}
                </div>
              </div>
              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <div className='text-sm text-gray-500'>Monto adeudo</div>
                  <div className='font-semibold'>
                    S/. {summary.prestamos_activos.monto_adeudo.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className='text-sm text-gray-500'>Cuotas pendientes</div>
                  <div className='font-semibold'>
                    {summary.prestamos_activos.cuotas_pendientes}
                  </div>
                </div>
                <div>
                  <div className='text-sm text-gray-500'>
                    Monto próxima cuota
                  </div>
                  <div className='font-semibold'>
                    S/.{' '}
                    {summary.prestamos_activos.monto_proxima_cuota.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members and Shares Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Socios y Acciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Acciones</TableHead>
                <TableHead>Valor en acciones</TableHead>
                <TableHead>Cantidad de prestamos activos</TableHead>
                <TableHead>Monto adeudado en prestamos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.user.full_name}</TableCell>
                  <TableCell>{summary.acciones.count}</TableCell>
                  <TableCell>S/. {summary.acciones.valor.toFixed(2)}</TableCell>
                  <TableCell>
                    {
                      prestamos.filter(
                        (p) =>
                          p.memberId === member.id &&
                          ['PARTIAL', 'PENDING'].includes(p.status)
                      ).length
                    }
                  </TableCell>
                  <TableCell>
                    S/. {summary.prestamos_activos.monto_adeudo.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Active Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Prestamos Activos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Socio</TableHead>
                <TableHead>Monto solicitado</TableHead>
                <TableHead>Monto adeudo</TableHead>
                <TableHead>Cuotas pendientes</TableHead>
                <TableHead>Monto de proxima cuota</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prestamos
                .filter((prestamo) =>
                  ['PARTIAL', 'PENDING'].includes(prestamo.status)
                )
                .map((prestamo) => {
                  const cuotasPendientes = prestamo.paymentSchedule.filter(
                    (p) => !(p.status === 'PAID')
                  ).length;
                  const proximaCuota =
                    prestamo.paymentSchedule.find(
                      (p) => !!(p.status === 'PAID')
                    )?.expected_amount || 0;
                  return (
                    <TableRow key={prestamo.id}>
                      <TableCell>{memberDetail.user.full_name}</TableCell>
                      <TableCell>
                        S/. {Number(prestamo.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        S/.{' '}
                        {prestamo.paymentSchedule
                          .filter((p) => !!(p.status === 'PAID'))
                          .reduce((sum, p) => sum + p.expected_amount, 0)
                          .toFixed(2)}
                      </TableCell>
                      <TableCell>{cuotasPendientes}</TableCell>
                      <TableCell>S/. {proximaCuota.toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberSection;
