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
  UserCircle,
  ClipboardList,
  AlertCircle,
  DollarSign,
  FileText,
  Calculator,
  Building2,
  PlusCircle,
  FileSpreadsheet,
  Users,
  PiggyBank,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useResumen } from '@/hooks/useResumenSection';
const { useMemberSection } = require('@/hooks/useMemberSection');

interface ResumenProps {
  juntaId: string;
}

const Resumen: React.FC<ResumenProps> = ({ juntaId }) => {
  const router = useRouter();
  const { junta, members, activePrestamos, summary, isLoading } =
    useResumen(juntaId);
  // console.log('activePrestamos: ', activePrestamos);
  console.log('summary: ', summary);
  console.log('junta: ', junta);
  const { memberDetail, prestamos } = useMemberSection(juntaId);
  console.log('prestamos: ', prestamos);
  console.log('memberDetail: ', memberDetail);

  const menuItems = [
    {
      label: 'Socios',
      icon: UserCircle,
      route: `/socios`,
      color: 'w-full justify-start bg-softGreen text-white',
    },
    {
      label: 'Asistencia',
      icon: ClipboardList,
      route: `/asistencia`,
      color: 'w-full justify-start bg-goldenYellow text-white',
    },
    {
      label: 'Multas',
      icon: AlertCircle,
      route: `/multas`,
      color: 'w-full justify-start bg-coralRed text-white',
    },
    {
      label: 'Compra de Acciones',
      icon: DollarSign,
      route: `/acciones`,
      color: 'w-full justify-start bg-violetPurple text-white',
    },
    {
      label: 'Pago de Prestamos',
      icon: FileText,
      route: `/pagos`,
      color: 'w-full justify-start bg-teal text-white',
    },
    {
      label: 'Registrar Prestamo',
      icon: Calculator,
      route: `/prestamos`,
      color: 'w-full justify-start bg-periwinkleBlue text-white',
    },
    {
      label: 'Utilidades',
      icon: Building2,
      route: `/utilidades`,
      color: 'w-full justify-start bg-limeGreen text-white',
    },
    {
      label: 'Gastos Administrativos',
      icon: PlusCircle,
      route: `/gastos`,
      color: 'w-full justify-start bg-burntOrange text-white',
    },
    {
      label: 'Otros Ingresos',
      icon: FileSpreadsheet,
      route: `/ingresos`,
      color: 'w-full justify-start bg-slateGray text-white',
    },
    {
      label: 'Actas y Asambleas',
      icon: Users,
      route: `/actas`,
      color: 'w-full justify-start bg-rosePink text-white',
    },
  ];

  if (isLoading) {
    return (
      <div className='flex justify-center items-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900' />
      </div>
    );
  }

  return (
    <div className='flex h-screen'>
      {/* Side Menu */}
      <div className='w-64 bg-gray-100 p-4 space-y-2'>
        {menuItems.map((item) => (
          <Button
            key={item.label}
            variant='ghost'
            className={item.color}
            onClick={() => router.push(item.route)}
          >
            <item.icon className='mr-2 h-4 w-4' />
            {item.label}
          </Button>
        ))}
      </div>

      {/* Main Content */}
      <div className='flex-1 p-8 space-y-6'>
        {/* Capital Summary Cards */}
        <div className='grid grid-cols-3 gap-6'>
          <div></div>
          <Card className=''>
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
          </Card>
          <div></div> <div></div>
          {/* <Card>
            <CardContent className='pt-6'>
              <div className='text-sm text-gray-500'>Reserva Capital</div>
              <div className='text-2xl font-bold'>
                S/. {summary.reserva_capital.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <div className='text-sm text-gray-500'>Fondo Social</div>
              <div className='text-2xl font-bold'>
                S/. {summary.fondo_social.toFixed(2)}
              </div>
            </CardContent>
          </Card> */}
          <Button
            variant='default'
            className='w-full bg-periwinkleBlue text-white'
            onClick={() => router.push('/asambleas/nueva')}
          >
            Iniciar Asamblea
          </Button>
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
                {members.map((member) => (
                  <TableRow
                    key={member.id}
                    className='cursor-pointer hover:bg-gray-50'
                    onClick={() => router.push(`/socios/${member.id}`)}
                  >
                    <TableCell>{member?.user?.full_name}</TableCell>
                    {/* <TableCell>{member.}</TableCell> */}
                    <TableCell>
                      {/* S/. {member.user.acciones_value?.toFixed(2)} */}
                    </TableCell>
                    <TableCell>
                      {
                        activePrestamos.filter((p) => p.memberId === member.id)
                          .length
                      }
                    </TableCell>
                    <TableCell>
                      S/.{' '}
                      {activePrestamos
                        .filter((p) => p.memberId === member.id)
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
                        // members.find((m) => m.id === prestamo.memberId)
                        //   ?.full_name
                      }
                    </TableCell>
                    <TableCell>
                      S/. {Number(prestamo.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      S/. {Number(prestamo.remaining_amount).toFixed(2)}
                    </TableCell>
                    {/* <TableCell>{prestamo.remaining_installments}</TableCell> */}
                    {/* <TableCell>
                      S/.{' '}
                      {prestamo.paymentSchedule
                        .find((p) => !p.paid)
                        ?.expected_amount.toFixed(2) || '0.00'}
                    </TableCell> */}
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
