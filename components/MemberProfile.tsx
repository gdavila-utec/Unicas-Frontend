import { UserCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {LogoutButton} from '@/components/LogoutButton';

interface MemberProfilePageProps {
  memberId?: string;
}

export default function MemberProfilePage({
  memberId,
}: MemberProfilePageProps): JSX.Element {
  const { data, isLoading, error } = useMemberProfile(memberId);

  if (!memberId) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p>No se ha especificado un ID de miembro</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p>Error al cargar el perfil: {(error as Error).message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p>No se encontraron datos del perfil</p>
      </div>
    );
  }

  const {
    memberInfo,
    acciones,
    prestamosActivos,
    accionesDetalle,
  } = data;

  return (
    <div className='min-h-screen bg-gray-50'>
      <main className='container mx-auto p-4 space-y-6 '>
        {/* Profile Section */}
        <div className='grid md:grid-cols-3 gap-4 '>
          {/* Member Info Card */}
          <Card className='md:col-span-1'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <UserCircle className='h-6 w-6' />
                Perfil del Socio
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 '>
              <div>
                <p className='text-sm text-gray-500'>Nombre:</p>
                <p className='font-medium'>{memberInfo.nombre}</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>DNI:</p>
                <p className='font-medium'>{memberInfo.dni}</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Celular:</p>
                <p className='font-medium'>{memberInfo.celular}</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Cargo:</p>
                <p className='font-medium'>{memberInfo.cargo}</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Fecha de Ingreso:</p>
                <p className='font-medium'>
                  {format(new Date(memberInfo.fecha_ingreso), 'dd/MM/yyyy', {
                    locale: es,
                  })}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Actividad Productiva:</p>
                <p className='font-medium'>{memberInfo.actividad_productiva}</p>
              </div>
              <div className='w-full flex justify-end px-8'>
                <p className=''>
                  <LogoutButton />
                </p>
              </div>
              {/* <Button
                className='w-full'
                variant='secondary'
              >
                Ver toda la información
              </Button> */}
            </CardContent>
          </Card>

          {/* Shares Card */}
          <Card className='md:col-span-1'>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 p-8'>
              <div className='text-4xl font-bold'>{acciones.cantidad}</div>
              <div className='text-md text-gray-500 font-semibold gap-4'>
                Valor:
                <p>
                  S/.{' '}
                  {acciones.valor.toLocaleString('es-PE', {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Active Loans Summary Card */}
          <Card className='md:col-span-1 '>
            <CardHeader>
              <CardTitle>Préstamos Activos</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 p-8'>
              <div className='text-4xl font-bold '>
                {prestamosActivos.length}
              </div>
              <div className='text-md font-semibold gap-4 text-gray-500'>
                Total adeudado:
                <p>
                  S/.{' '}
                  {prestamosActivos
                    .reduce((sum, prestamo) => sum + prestamo.monto_adeudo, 0)
                    .toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Loans Section */}
        {prestamosActivos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Préstamos Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Monto solicitado</TableHead>
                      <TableHead>Monto adeudo</TableHead>
                      <TableHead>Cuotas pendientes</TableHead>
                      <TableHead>Próxima cuota</TableHead>
                      <TableHead>Fecha próximo pago</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prestamosActivos.map((prestamo) => (
                      <TableRow key={prestamo.id}>
                        <TableCell>
                          S/.{' '}
                          {prestamo.monto_solicitado.toLocaleString('es-PE', {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          S/.{' '}
                          {prestamo.monto_adeudo.toLocaleString('es-PE', {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>{prestamo.cuotas_pendientes}</TableCell>
                        <TableCell>
                          S/.{' '}
                          {prestamo.monto_proxima_cuota.toLocaleString(
                            'es-PE',
                            {
                              minimumFractionDigits: 2,
                            }
                          )}
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(prestamo.fecha_proxima_cuota),
                            'dd/MM/yyyy',
                            { locale: es }
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              prestamo.estado === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {prestamo.estado === 'PENDING'
                              ? 'Pendiente'
                              : 'Parcial'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shares Detail */}
        {accionesDetalle.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Historial de Acciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Valor Unitario</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Descripción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accionesDetalle.map((accion) => (
                      <TableRow key={accion.id}>
                        <TableCell>{accion.type}</TableCell>
                        <TableCell>{accion.amount}</TableCell>
                        <TableCell>
                          S/.{' '}
                          {accion.shareValue.toLocaleString('es-PE', {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          S/.{' '}
                          {(accion.amount * accion.shareValue).toLocaleString(
                            'es-PE',
                            { minimumFractionDigits: 2 }
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(accion.createdAt), 'dd/MM/yyyy', {
                            locale: es,
                          })}
                        </TableCell>
                        <TableCell>{accion.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
