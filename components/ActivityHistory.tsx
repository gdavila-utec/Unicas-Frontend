import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { MemberProfileData } from '@/z';

interface ActivityHistoryProps {
  loans: MemberProfileData['prestamos']['activos'];
  shares: MemberProfileData['acciones']['detalle'];
  formatDate: (date: string) => string;
}

export function ActivityHistory({
  loans,
  shares,
  formatDate,
}: ActivityHistoryProps) {
  return (
    <div className='space-y-6'>
      {/* Active Loans Section */}
      {loans.length > 0 && (
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
                  {loans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>
                        S/.{' '}
                        {loan.monto_solicitado.toLocaleString('es-PE', {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        S/.{' '}
                        {loan.monto_adeudo.toLocaleString('es-PE', {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>{loan.cuotas_pendientes}</TableCell>
                      <TableCell>
                        S/.{' '}
                        {loan.monto_proxima_cuota.toLocaleString('es-PE', {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        {formatDate(loan.fecha_proxima_cuota)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            loan.estado === 'PENDING' ? 'destructive' : 'secondary'
                          }
                        >
                          {loan.estado === 'PENDING' ? 'Pendiente' : 'Parcial'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shares History Section */}
      {shares.length > 0 && (
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
                  {shares.map((share) => (
                    <TableRow key={share.id}>
                      <TableCell>{share.type}</TableCell>
                      <TableCell>{share.amount}</TableCell>
                      <TableCell>
                        S/.{' '}
                        {share.shareValue.toLocaleString('es-PE', {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        S/.{' '}
                        {(share.amount * share.shareValue).toLocaleString(
                          'es-PE',
                          { minimumFractionDigits: 2 }
                        )}
                      </TableCell>
                      <TableCell>{formatDate(share.createdAt)}</TableCell>
                      <TableCell>{share.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
