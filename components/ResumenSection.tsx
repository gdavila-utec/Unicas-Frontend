import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface Member {
  id: number;
  full_name: string;
  document_type: string;
  document_number: string;
}

interface Loan {
  id: number;
  member_name: string;
  amount: number;
  remaining_amount: number;
  remaining_installments: number;
}

interface Multa {
  id: number;
  member_name: string;
  reason: string;
  amount: number;
}

interface Accion {
  id: number;
  member_name: string;
  quantity: number;
  value: number;
}

interface Pago {
  id: number;
  member_name: string;
  amount: number;
  fecha_pago: string;
}

interface Capital {
  reserva_legal: number;
  fondo_social: number;
}

const ResumenSection = ({ juntaId }: { juntaId: string }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [multas, setMultas] = useState<Multa[]>([]);
  const [acciones, setAcciones] = useState<Accion[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [capital, setCapital] = useState<Capital | null>(null);
  const { isAuthenticated, isAdmin, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const fetchWithAuth = async (url: string) => {
          const response = await fetch(url, {
            headers,
          });
          if (response.status === 401) {
            router.push('/sign-in');
            return null;
          }
          console.log('response YY: ', response);
          if (!response.ok) {
            throw new Error(`Failed to fetch from ${url}`);
          }
          return response.json();
        };

        const [
          membersData,
          loansData,
          multasData,
          accionesData,
          pagosData,
          capitalData,
        ] = await Promise.all([
          fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/members/junta/${juntaId}`
          ),
          fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/prestamos/junta/${juntaId}`
          ),
          fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/multas/junta/${juntaId}`
          ),
          fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/acciones/junta/${juntaId}`
          ),
          fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/prestamos/junta/${juntaId}/pagos`
          ),
          fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/capital/social/junta/${juntaId}`
          ),
        ]);

        if (membersData) setMembers(membersData);
        if (loansData) setLoans(loansData);
        if (multasData) setMultas(multasData);
        if (accionesData) setAcciones(accionesData);
        if (pagosData) setPagos(pagosData);
        if (capitalData) setCapital(capitalData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [juntaId, isAuthenticated, token, router]);

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
                  <TableCell>{loan.member_name}</TableCell>
                  <TableCell>S/.{loan.amount}</TableCell>
                  <TableCell>S/.{loan.remaining_amount}</TableCell>
                  <TableCell>{loan.remaining_installments}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4}>No hay préstamos activos</TableCell>
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
          <TableBody>
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
          </TableBody>
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
              acciones.map((accion) => (
                <TableRow key={accion.id}>
                  <TableCell>{accion.member_name}</TableCell>
                  <TableCell>{accion.quantity}</TableCell>
                  <TableCell>S/.{accion.value}</TableCell>
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
            {pagos.length > 0 ? (
              pagos.map((pago) => (
                <TableRow key={pago.id}>
                  <TableCell>{pago.member_name}</TableCell>
                  <TableCell>S/.{pago.amount}</TableCell>
                  <TableCell>
                    {format(new Date(pago.fecha_pago), 'yyyy-MM-dd')}
                  </TableCell>
                </TableRow>
              ))
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
            <p>Reserva Legal: S/{capital.reserva_legal}</p>
            <p>Fondo Social: S/{capital.fondo_social}</p>
          </>
        ) : (
          <p>No hay datos de capital disponibles</p>
        )}
      </div>
    </div>
  );
};

export default ResumenSection;
