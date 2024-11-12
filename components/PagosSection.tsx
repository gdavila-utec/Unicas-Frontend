import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { InputAmount } from '@/components/ui/input-amount';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { usePagos } from '@/hooks/usePagosSections';
import type { Payment } from '@/types';

interface PagosSectionProps {
  juntaId: string;
}

const PagosSection: React.FC<PagosSectionProps> = ({ juntaId }) => {
  const {
    form,
    members,
    loans,
    refetchLoanStatus,
    paymentHistory,
    loanStatusUpdatePrincipal,
    isLoading,
    handleFormChange,
    handleCuotaCheck,
    handleDeletePago,
    onSubmit,
  } = usePagos(juntaId);

  useEffect(() => {
    refetchLoanStatus();
  }, [refetchLoanStatus]);

  const loanStatus = React.useMemo(() => {
    if (!loanStatusUpdatePrincipal?.remainingPayments) return null;

    const filteredPayments = loanStatusUpdatePrincipal.remainingPayments
      .filter((item, index) => {
        if (index === 0) return true;
        const previousItem =
          loanStatusUpdatePrincipal.remainingPayments[index - 1];
        return item.installment_number !== previousItem.installment_number;
      })
      .map((payment: any) => {
        // if (payment.id === form.watch('loan')) {
        return {
          ...payment,
          // principal: {remainingPrincipal: payment.expected_amount - payment.interest, saldo: loanStatus.remainingAmount - loanStatus.totalPaid},
          principal: payment.expected_amount - payment.interest,
        };
        // }
        // return payment;
      });
    console.log('filteredPayments: ', filteredPayments);

    return {
      ...loanStatusUpdatePrincipal,
      remainingPayments: filteredPayments,
    };
  }, [loanStatusUpdatePrincipal, form]);

  const saldo = React.useMemo(() => {
    return loanStatus?.remainingPayments?.reduce(
      (acc, item) => acc + item.expected_amount,
      0
    );
  }, [loanStatus]);

  const totalCuotas = React.useMemo(() => {
    return loanStatusUpdatePrincipal?.remainingPayments?.reduce(
      (acc, item) => acc + item.principal,
      0
    );
  }, [loanStatusUpdatePrincipal]);

  // const totalDeuda = (memberId: string, loanId: string) => {
  //   return loans
  //     .filter((loan) => loan.memberId === memberId && loan.id === loanId)
  //     .reduce((acc, loan) => acc + loan.paymentSchedule.reduce(pago=>pago.interest), 0);
  // };
  // const interesPagado = (memberId: string, loanId: string) => {
  //   return paymentHistory
  //     .filter(
  //       (payment) =>
  //         payment.memberId === memberId &&
  //         payment.prestamo.original_prestamo_id === loanId
  //     )
  //     .reduce((acc, payment) => acc + payment.interest_paid, 0);
  // };

  const interesPagado = React.useMemo(() => {
    return loanStatusUpdatePrincipal?.remainingPayments.reduce(
      (acc, item) => acc + item.interest,
      0
    );
  }, [loanStatusUpdatePrincipal]);

  const totalPrestado = React.useMemo(() => {
    return loanStatusUpdatePrincipal?.remainingPayments.reduce(
      (acc, item) => acc + item.principal + item.interest,
      0
    );
  }, [loanStatusUpdatePrincipal]);

  const saldoPendienteDePago = (loanId: string, memberId: string) => {
    return paymentHistory.reduce((acc, item) => acc + item.remaining_amount, 0);
  };

  const totalPrestamo = (loanId: string, memberId: string) => {
    return loans
      .filter((loan) => loan.id === loanId && loan.memberId === memberId)
      .reduce((acc, item) => acc + item.amount, 0);
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900' />
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      <div>
        <Button
          variant='outline'
          className='mb-6'
        >
          Volver a la lista de juntas
        </Button>
        <h1 className='text-2xl font-bold mb-6'>Junta Vecinal 2023</h1>
      </div>

      <div className='bg-white p-6 rounded-lg shadow'>
        <h2 className='text-xl font-bold mb-6'>Registrar Pago de Préstamo</h2>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6'
            onChange={handleFormChange}
          >
            {/* Member and Date Selection */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <FormField
                control={form.control}
                name='member'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Socio</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Seleccionar socio' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {members
                          .filter((member) => member.member_role === 'socio')
                          .map((member) => (
                            <SelectItem
                              key={member.id}
                              value={member.id}
                            >
                              {member?.full_name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='date'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de pago</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            className='w-full justify-start text-left'
                          >
                            {field.value
                              ? format(field.value, 'dd/MM/yyyy')
                              : 'Seleccionar fecha'}
                            <CalendarIcon className='ml-auto h-4 w-4' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
            </div>

            {/* Loan Selection and Payment Fields */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              <FormField
                control={form.control}
                name='loan'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Préstamo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Seleccionar préstamo' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loans.map((loan) => (
                          <SelectItem
                            key={loan.id}
                            value={loan.id}
                          >
                            {`${loan.loan_number} - ${loan.loan_code} - ${loan.loan_type} - ${loan.amount} soles - ${loan.number_of_installments} cuotas`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='capital_payment'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuota pago de capital</FormLabel>
                    <FormControl>
                      <InputAmount
                        type='number'
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='interest_payment'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto pago de intereses</FormLabel>
                    <FormControl>
                      <InputAmount
                        type='number'
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Payment Options */}
            <div className='space-y-4 flex gap-20 ml-1'>
              <div className='flex space-x-6 items-center'>
                <span className='text-sm text-gray-500'>
                  Saldo pendiente: S/. {saldo ? saldo.toFixed(2) : 'S/. 0.00'}
                </span>
              </div>
            </div>

            {/* Installments Section */}
            {loanStatus && (
              <div className='p-4'>
                <div className='font-semibold mb-5 text-md'>Cuotas a pagar</div>
                <div>
                  <div className='grid grid-cols-7 text-xs md:text-sm mb-5 font-medium'>
                    <p className='text-right'></p>
                    <p className='text-left w-10 min-w-[64px]'>Cuota #</p>
                    <p className='text-left w-20'>Fecha</p>
                    <p className='text-left w-40'>Pago de capital</p>
                    <p className='text-right w-10'>Interes</p>
                    <p className='text-center w-10'>Cuota</p>
                    <p className='text-left w-10'>Saldo</p>
                  </div>

                  {loanStatus?.remainingPayments &&
                    loanStatus.remainingPayments.map((installment: Payment) => (
                      <div
                        key={installment.id}
                        className='grid grid-cols-7 text-xs md:text-sm py-4 border-b border-gray-100 overflow-x-auto'
                      >
                        <p className='text-left w-0'>
                          <FormField
                            control={form.control}
                            name='checkValue'
                            render={({ field }) => (
                              <FormControl>
                                <Checkbox
                                  name={installment.id}
                                  checked={field.value}
                                  onCheckedChange={() =>
                                    handleCuotaCheck(installment, field.value)
                                  }
                                />
                              </FormControl>
                            )}
                          />
                        </p>
                        <p className='text-center w-5'>
                          {installment.installment_number}
                        </p>
                        <p className='text-left min-w-[64px] text-xs md:text-sm w-10 mr-10'>
                          {format(new Date(installment.due_date), 'dd/MM/yyyy')}
                        </p>
                        <p className='text-right w-10'>
                          {installment.principal.toFixed(2)}
                        </p>
                        <p className='text-right w-10'>
                          {installment.interest.toFixed(2)}
                        </p>
                        <p className='text-center w-10'>
                          {installment.expected_amount.toFixed(2)}
                        </p>
                        <p className='text-center w-10'>
                          {/* {(saldo - installment.expected_amount).toFixed(2)} */}
                        </p>
                      </div>
                    ))}
                  <div className='grid grid-cols-7 text-xs md:text-sm py-4 border-b border-gray-100 font-bold'>
                    <p className='text-left w-0'></p>
                    <p className='text-center w-5'></p>
                    <p className='text-left w-20'>Totales</p>
                    <p className='text-right w-10'>
                      {' '}
                      {loanStatus.remainingAmount.toFixed(2)}
                    </p>
                    <p className='text-right w-10'>{interesPagado}</p>
                    <p className='text-center w-10'> {saldo}</p>
                    <p className='text-center w-10'>
                      {(
                        totalPrestamo(
                          form.getValues('loan'),
                          form.getValues('member')
                        ) - saldo
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              type='submit'
              className='w-auto'
              disabled={isLoading}
            >
              {isLoading ? 'Procesando...' : 'Registrar Pago'}
            </Button>
          </form>
        </Form>

        {/* Payment History Table */}
        <div className='mt-8'>
          <h2 className='text-xl font-bold mb-4'>Historial de Pagos</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N°</TableHead>
                <TableHead>Nombre completo (Socio)</TableHead>
                <TableHead>Fecha de pago</TableHead>
                <TableHead>Pago de capital</TableHead>
                <TableHead>Pago de intereses</TableHead>
                <TableHead>Pago de mora</TableHead>
                <TableHead>Pago de cuota</TableHead>
                <TableHead>Saldo pendiente de pago</TableHead>
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
                    <TableCell>0</TableCell>
                    <TableCell>{payment.amount.toFixed(2)}</TableCell>
                    <TableCell>{payment.remaining_amount.toFixed(2)}</TableCell>
                    <TableCell>{payment.remaining_installments}</TableCell>
                    <TableCell>{payment.prestamo.status}</TableCell>
                    <TableCell>
                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => handleDeletePago(payment.id)}
                        disabled={isLoading}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default PagosSection;
