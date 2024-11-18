// components/Resumen.tsx
import React, { use } from 'react';
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
import {
  PiggyBank,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useResumen } from '@/hooks/useResumenSection';
import type { Prestamo, Junta, MemberResponse, Member } from '@/types';
import { InitialLoader } from '../components/initial-loader';

interface ResumenProps {
  juntaId: string;
  menuItems: {
    label: string;
    route: string;
    icon: React.FC;
    color: string;
  }[];
}

const Resumen: React.FC<ResumenProps> = ({ juntaId }) => {
  const router = useRouter();
  const {
    sharesByMember,
    junta,
    members,
    activePrestamos,
    summary,
    isLoading,
  } = useResumen(juntaId);

  if (isLoading) {
    return (
      <InitialLoader  />
    );
  }

  return (
    <div className='flex lg:flex-row flex-col lg:h-screen h-fit'>
      {/* Main Content */}
      <div className='flex-1 p-8 space-y-6'>
        {/* Capital Summary Cards */}
        <div className='grid grid-cols-3 gap-6 '>
          <Card className='w-full  col-span-3'>
            <CardContent className='pt-6 justify-center flex flex-col items-center gap-1'>
              <PiggyBank size={48} />
              <div className='text-lg text-gray-900 font-bol'>
                Capital Total S/. {summary.capital_total.toFixed(2)}
              </div>
              <div className='text-sm text-gray-500'>
                Reserva Legal S/. {summary.fondo_social.toFixed(2)}
              </div>
              <div className='text-sm text-gray-500'>
                Fondo Social S/. {summary.fondo_social.toFixed(2)}
              </div>
              <div className='text-2xl font-bold'></div>
            </CardContent>
            <Button
              variant='default'
              className='w-full bg-periwinkleBlue text-white'
              onClick={() => router.push('/asambleas/nueva')}
            >
              Iniciar Asamblea
            </Button>
          </Card>
        </div>
        {/* Members Table */}
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
                      {
                        members.find((m) => m.id === prestamo.memberId)
                          ?.full_name
                      }
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
    </div>
  );
};

export default Resumen;
