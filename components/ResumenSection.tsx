import React from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { useResumen } from '@/hooks/useResumenSection';

interface ResumenSectionProps {
  juntaId: string;
}

const ResumenSection: React.FC<ResumenSectionProps> = ({ juntaId }) => {
  const { isAuthenticated } = useAuth();
  const { members, loans, acciones, payments, capital, isLoading, error } =
    useResumen(juntaId);

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className='flex justify-center items-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900' />
      </div>
    );
  }

  if (error) {
    return <div className='text-red-500 p-4'>Error: {error.message}</div>;
  }

  return (
    <div className='space-y-8'>
      <h2 className='text-2xl font-bold mb-4'>Resumen de Junta</h2>

      {/* Members Section */}
      <div>
        <h3 className='text-xl font-semibold'>Lista de Socios</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Documento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length > 0 ? (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.full_name}</TableCell>
                  <TableCell>
                    {member.document_type}: {member.document_number}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2}>No hay socios registrados</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Loans Section */}
      <div>
        <h3 className='text-xl font-semibold'>Préstamos Activos</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Miembro</TableHead>
              <TableHead>Monto Original</TableHead>
              <TableHead>Monto Adeudado</TableHead>
              <TableHead>Cuotas Pendientes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.length > 0 ? (
              loans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>{loan.member.full_name}</TableCell>
                  <TableCell>S/.{loan.amount}</TableCell>
                  <TableCell>S/.{loan.remaining_amount}</TableCell>
                  <TableCell>
                    {(loan.paymentSchedule ?? []).filter(
                      (payment) => payment.status !== 'PAID'
                    ).length || 0}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className='text-center'
                >
                  No hay prestamos pendientes
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Acciones Section */}
      <div>
        <h3 className='text-xl font-semibold'>Acciones Compradas</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Miembro</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {acciones.length > 0 ? (
              acciones.map((accion) => (
                <TableRow key={accion.id}>
                  <TableCell>{accion.member.full_name}</TableCell>
                  <TableCell>{accion.amount}</TableCell>
                  <TableCell>S/.{accion.shareValue}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3}>No hay acciones registradas</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Payments Section */}
      <div>
        <h3 className='text-xl font-semibold'>Historial de Pagos</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Miembro</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.length > 0 ? (
              loans.flatMap((loan) =>
                loan.paymentSchedule.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{loan.member.full_name}</TableCell>
                    <TableCell>
                      S/.{payment.expected_amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(payment.due_date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          payment.status === 'PAID'
                            ? 'text-green-500'
                            : 'text-red-500'
                        }
                      >
                        {payment.status === 'PAID' ? 'Pagado' : 'Pendiente'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )
            ) : (
              <TableRow>
                <TableCell colSpan={4}>No hay pagos registrados</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Capital Section */}
      <div>
        <h3 className='text-xl font-semibold'>Capital Social</h3>
        {capital ? (
          <>
            <p>Capital Total: S/.{capital.total}</p>
            <p>Reserva Legal: S/.{capital.base.toFixed(2)}</p>
            <p>Fondo Social: S/.{capital.available.toFixed(2)}</p>
          </>
        ) : (
          <p>No hay datos de capital disponibles</p>
        )}
      </div>
    </div>
  );
};

export default ResumenSection;
