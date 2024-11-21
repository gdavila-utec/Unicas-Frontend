// components/Resumen.tsx
import React, { use } from 'react';
import { useRouter } from 'next/navigation';

import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


import { cn } from '@/lib/utils';
import { useResumen } from '@/hooks/useResumenSection';
import { usePagos } from '@/hooks/usePagosSections';
import { BaseStepProps, MenuItem } from '@/types';
import { InitialLoader } from '../components/initial-loader';

// interface ResumenProps extends BaseStepProps {
//   juntaId: string;
//   // menuItems: {
//   //   label: string;
//   //   route: string;
//   //   icon: React.FC;
//   //   color: string;
//   // }[];
//   menuItems: MenuItem[]
// }

interface CierreActaProps extends BaseStepProps {
  juntaId: string;
}

const CierreActa: React.FC<CierreActaProps> = ({ juntaId }) => {
  const router = useRouter();
  const {
    sharesByMember,
    junta,
    members,
    activePrestamos,

    isLoading,
  } = useResumen(juntaId);
  const { paymentHistory } = usePagos(juntaId);

  if (isLoading) {
    return <InitialLoader />;
  }

  return (
    <div className='flex flex-col'>
      {/* Main Content */}

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Compradas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Acciones</TableHead>
                <TableHead>Valor en acciones</TableHead>
                <TableHead>Cantidad de prestamos activos</TableHead>
                <TableHead>Monto adeudo en prestamos</TableHead>
                <TableHead>Utilidades Acumuladas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sharesByMember.map((member) => (
                <TableRow
                  key={member.memberId}
                  className='cursor-pointer hover:bg-gray-50'
                  onClick={() => router.push(`/socios/${member.memberId}`)}
                >
                  <TableCell>
                    {member.memberInfo.fullName || 'No name available'}
                  </TableCell>
                  <TableCell>{member.totalShares}</TableCell>
                  <TableCell>S/. {member.totalValue.toFixed(2)}</TableCell>
                  <TableCell>
                    {
                      activePrestamos.filter(
                        (p) => p.memberId === member.memberId
                      ).length
                    }
                  </TableCell>
                  <TableCell>
                    S/.{' '}
                    {activePrestamos
                      .filter((p) => p.memberId === member.memberId)
                      .reduce((sum, p) => sum + Number(p.remaining_amount), 0)
                      .toFixed(2)}
                  </TableCell>
                  {/* <TableCell>S/. {member.utilidades?.toFixed(2)}</TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Prestamos Recuperados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N°</TableHead>
                <TableHead>Nombre </TableHead>
                <TableHead>Fecha </TableHead>
                <TableHead>Pago de capital</TableHead>
                <TableHead>Pago de intereses</TableHead>
                <TableHead>Pago de mora</TableHead>
                <TableHead>Pago de cuota</TableHead>
                <TableHead>Saldo </TableHead>
                <TableHead>Cuotas pendientes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className='text-center py-4'
                  >
                    No hay pagos registrados
                  </TableCell>
                </TableRow>
              ) : (
                paymentHistory.map((payment, index) => (
                  <TableRow key={payment.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{payment.prestamo.member.full_name}</TableCell>
                    <TableCell>
                      {format(new Date(payment.date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>{payment.principal_paid.toFixed(2)}</TableCell>
                    <TableCell>{payment.interest_paid.toFixed(2)}</TableCell>
                    <TableCell>0.00</TableCell>
                    <TableCell>{payment.amount.toFixed(2)}</TableCell>
                    <TableCell>{payment.remaining_amount.toFixed(2)}</TableCell>
                    <TableCell>{payment.remaining_installments}</TableCell>
                    <TableCell>{payment.prestamo.status}</TableCell>
                  </TableRow>
                ))
              )}
              {paymentHistory.length > 0 && (
                <TableRow className='bg-gray-100'>
                  <TableCell
                    colSpan={11}
                    className='text-center'
                  >
                    <span className='font-bold'>Total</span>
                    <span className='ml-2 font-bold'>
                      S/.{' '}
                      {paymentHistory
                        .reduce((acc, payment) => acc + payment.amount, 0)
                        .toFixed(2)}
                    </span>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Active Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Prestamos Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Socio</TableHead>
                <TableHead>Monto solicitado</TableHead>
                <TableHead>Monto adeudo</TableHead>
                <TableHead>Cuotas pendientes</TableHead>
                <TableHead>Monto proxima cuota</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activePrestamos.map((prestamo) => (
                <TableRow
                  key={prestamo.id}
                  className='cursor-pointer hover:bg-gray-50'
                  onClick={() => router.push(`/prestamos/${prestamo.id}`)}
                >
                  <TableCell>
                    {members.find((m) => m.id === prestamo.memberId)?.full_name}
                  </TableCell>
                  <TableCell>
                    S/. {Number(prestamo.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    S/. {Number(prestamo.remaining_amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {
                      prestamo.paymentSchedule.filter(
                        (payment) => payment.status !== 'PAID'
                      ).length
                    }
                  </TableCell>
                  <TableCell>
                    S/.{' '}
                    {prestamo.paymentSchedule
                      .find((p) => p.status !== 'PAID')
                      ?.expected_amount.toFixed(2) || '0.00'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CierreActa;
