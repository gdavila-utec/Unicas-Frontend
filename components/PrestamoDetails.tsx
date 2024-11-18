'use client';

import React, { useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePrestamoDetails } from '@/hooks/usePrestamoDetails';
import Link from 'next/link';

interface PrestamoDetailsProps {
  id: string;
}

export default function PrestamoDetails({ id }: PrestamoDetailsProps) {
  const {
    prestamo,
    loanStatus,
    juntaId, // Now available from the hook
    isLoading,
    error,
    getTotalInterest,
    getTotalPrincipal,
    formatMoney,
    formatDate,
    exportToPDF,
  } = usePrestamoDetails(id);
  
  useEffect(() => {
    if (juntaId) {
      // Do something with juntaId
    }
  }, [juntaId]);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900' />
      </div>
    );
  }

  if (error || !prestamo) {
    return (
      <div className='text-center text-red-500 p-4'>
        Error al cargar los detalles del préstamo
      </div>
    );
  }

  return (
    <div className='container mx-auto p-4 space-y-6 bg-white rounded-md w-full bg-red-600'>
      <div>
        <Link href={`/juntas/${juntaId}`}>
          <Button>Regresar a Junta</Button>
        </Link>
      </div>
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Detalles del préstamo
          </h1>
          <p className='text-sm text-muted-foreground'>
            Cliente: {prestamo.member.document_number} -{' '}
            {prestamo.member.full_name}
          </p>
        </div>
        <Button
          variant='outline'
          className='flex items-center gap-2'
          onClick={exportToPDF}
          disabled={isLoading || !prestamo}
        >
          <FileText className='h-4 w-4' />
          {isLoading ? 'Cargando...' : 'Exportar PDF'}
        </Button>
      </div>

      <div className='grid md:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Detalles del préstamo</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='space-y-4'>
              <div className='text-center'>
                <h3 className='font-medium mb-1'>Forma de pago</h3>
                <p className='text-sm text-muted-foreground'>
                  {prestamo.payment_type}
                </p>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <h3 className='font-medium mb-1'>TIPO</h3>
                  <p className='text-sm text-muted-foreground'>
                    {prestamo.loan_type}
                  </p>
                </div>
                <div>
                  <h3 className='font-medium mb-1'>COD. ÚNICA</h3>
                  <p className='text-sm text-muted-foreground'>
                    {prestamo.loan_code}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <h3 className='font-medium mb-1'>Fecha otorgo</h3>
                  <p className='text-sm text-muted-foreground'>
                    {formatDate(prestamo.request_date)}
                  </p>
                </div>
                <div>
                  <h3 className='font-medium mb-1'>Fecha de pago</h3>
                  <p className='text-sm text-muted-foreground'>
                    {formatDate(prestamo.paymentSchedule[0].due_date)}
                  </p>
                </div>
              </div>

              <div className='text-center'>
                <h3 className='font-medium mb-1'>Monto</h3>
                <p className='text-2xl font-bold'>
                  {formatMoney(prestamo.amount)}
                </p>
              </div>

              <div className='text-center'>
                <h3 className='font-medium mb-1'>Plazo</h3>
                <p className='text-sm text-muted-foreground'>
                  {prestamo.number_of_installments} Meses
                </p>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <h3 className='font-medium mb-1'>Interés Mensual</h3>
                  <p className='text-sm text-muted-foreground'>
                    {prestamo.monthly_interest}%
                  </p>
                </div>
                <div>
                  <h3 className='font-medium mb-1'>Fecha vencimiento</h3>
                  <p className='text-sm text-muted-foreground'>
                    {formatDate(
                      prestamo.paymentSchedule[
                        prestamo.paymentSchedule.length - 1
                      ].due_date
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalle de fechas a pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-16'>Nº Cuotas</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Intereses</TableHead>
                  <TableHead>Amortización</TableHead>
                  <TableHead>Cuota</TableHead>
                  <TableHead>Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prestamo.paymentSchedule.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>{schedule.installment_number}</TableCell>
                    <TableCell>{formatDate(schedule.due_date)}</TableCell>
                    <TableCell>{formatMoney(schedule.interest)}</TableCell>
                    <TableCell>{formatMoney(schedule.principal)}</TableCell>
                    <TableCell>
                      {formatMoney(schedule.expected_amount)}
                    </TableCell>
                    <TableCell>
                      {formatMoney(prestamo.amount - schedule.expected_amount)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className='font-medium'>
                  <TableCell>Totales</TableCell>
                  <TableCell></TableCell>
                  <TableCell>{formatMoney(getTotalInterest())}</TableCell>
                  <TableCell>{formatMoney(getTotalPrincipal())}</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
