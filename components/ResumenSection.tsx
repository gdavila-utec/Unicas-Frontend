import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEffect, useState, ReactNode, useMemo } from 'react';
import { format, set } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { Junta, Member, Prestamo, Accion, PaymentHistory } from '@/types';
import { useJuntaStore } from '@/store/juntaValues';
import { usePrestamoStore } from '@/store/prestamoStore';
import { useAccionesStore } from '@/store/accionesStore';
import { useMemberStore } from '@/store/memberStore';
import { usePagosStore } from '@/store/pagosStore';

const ResumenSection = ({
  juntaId,
}: // junta,
{
  juntaId: string;
  // juntaLocal: Junta;
}) => {
  const { setPaymentSchedules, getLoanSchedule, setLoans, getJuntaLoans } =
    usePrestamoStore();
  const { setAcciones, getJuntaAcciones } = useAccionesStore();
  const { getCapitalAmounts, getJuntaById, getMembers } = useJuntaStore();
  const { setMembers, getJuntaMembers } = useMemberStore();
  const { setPayments } = usePagosStore();
  const members = getJuntaMembers() ?? [];

  const loans = getJuntaLoans(juntaId);
  const acciones = getJuntaAcciones(juntaId);
  const capital = getCapitalAmounts(juntaId);
  // const selectedJuntaData = setSelectedJunta();
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  useEffect(() => {
    const capital = getCapitalAmounts(juntaId);

    const fetchData = async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        const [loansData, accionesData, historialPagos] = await Promise.all([
          api.get<Prestamo[]>(`prestamos/junta/${juntaId}`),
          api.get<Accion[]>(`acciones/junta/${juntaId}`),
          api.get<PaymentHistory[]>(`junta-payments/${juntaId}/history`),
        ]);
        setLoans(loansData);
        // setMembers(junta.members);
        setAcciones(accionesData);
        setPayments(historialPagos);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error instanceof Error && error.message === 'Session expired') {
          router.push('/sign-in');
        }
      }
    };

    fetchData();
  }, [juntaId, isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className='space-y-8'>
      <h2 className='text-2xl font-bold mb-4'>Resumen de Junta</h2>
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
              members
                .filter((member) => member.user.member_role === 'socio')
                .map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.user.full_name}</TableCell>
                    <TableCell>
                      {member.user.document_type}: {member.user.document_number}
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
            {(loans ?? []).length > 0 ? (
              loans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>{loan.member.full_name}</TableCell>
                  <TableCell>${loan.amount}</TableCell>
                  <TableCell>${loan.remaining_amount}</TableCell>
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

      <div>
        <h3 className='text-xl font-semibold'>Historial de Multas</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Miembro</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Monto</TableHead>
            </TableRow>
          </TableHeader>
          {/* <TableBody>
            {multas.length > 0 ? (
              multas.map((multa) => (
                <TableRow key={multa.id}>
                  <TableCell>{multa.member_name}</TableCell>
                  <TableCell>{multa.reason}</TableCell>
                  <TableCell>S/.{multa.amount}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3}>No hay multas registradas</TableCell>
              </TableRow>
            )}
          </TableBody> */}
        </Table>
      </div>

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
              acciones.map((accion: any) => (
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

      <div>
        <h3 className='text-xl font-semibold'>Historial de Pagos</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Miembro</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.length > 0 ? (
              loans.map((loan) =>
                loan.paymentSchedule.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{loan.member.full_name}</TableCell>
                    <TableCell>
                      S/.{payment.expected_amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(payment.due_date), 'yyyy-MM-dd')}
                    </TableCell>
                    <TableCell>
                      {payment.status === 'PAID' ? (
                        <span className='text-green-500'>Pagado</span>
                      ) : (
                        <span className='text-red-500'>Pendiente</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )
            ) : (
              <TableRow>
                <TableCell colSpan={3}>No hay pagos registrados</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className='text-xl font-semibold'>Capital Social</h3>
        {capital ? (
          <>
            <p>Reserva Legal: S/{capital.base}</p>
            <p>Fondo Social: S/.{capital.available}</p>
          </>
        ) : (
          <p>No hay datos de capital disponibles</p>
        )}
      </div>
    </div>
  );
};

export default ResumenSection;
