import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { InputAmount } from '@/components/ui/input-amount';
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
import EnhancedInputAmount from '@/components/ui/enhanced-input-amount';

interface PagosSectionProps {
  juntaId: string;
}

export default function PagosSection({ juntaId }: PagosSectionProps) {
  const {
    form,
    members,
    loans,
    refetchLoanStatus,
    paymentHistory,
    loanStatusUpdatePrincipal,
    isLoading,
    handleFormChange,
    handleDeletePago,
    onSubmit,
  } = usePagos(juntaId);
  
  useEffect(() => {
    refetchLoanStatus();
  }, [refetchLoanStatus]);

  useEffect(() => {
    if ((loanStatusUpdatePrincipal?.remainingPayments ?? []).length > 0) {
      const nextPayment = loanStatusUpdatePrincipal?.remainingPayments?.[0] ?? {
        principal: 0,
        interest: 0,
      };
      form.setValue('capital_payment', nextPayment?.principal);
      form.setValue('interest_payment', nextPayment?.interest);
    }
  }, [loanStatusUpdatePrincipal, form]);

  const getSelectedLoanType = () => {
    const selectedLoanId = form.watch('loan');
    const selectedLoan = loans.find((loan) => loan.id === selectedLoanId);
    return selectedLoan?.loan_type;
  };

  const isCuotaVariable = getSelectedLoanType() === 'CUOTA_VARIABLE';

  const getNextPaymentAmount = () => {
    if (!loanStatusUpdatePrincipal?.remainingPayments?.length) return 0;
    return loanStatusUpdatePrincipal.remainingPayments[1]?.expected_amount || 0;
  };

  const getNextPaymentPrincipal = () => {
    if (isCuotaVariable) return 0;
    if (!loanStatusUpdatePrincipal?.remainingPayments?.length) return 0;
    return loanStatusUpdatePrincipal.remainingPayments[0]?.principal || 0;
  };

  const getNextPaymentInterest = () => {
    if (!loanStatusUpdatePrincipal?.remainingPayments?.length) return 0;
    return loanStatusUpdatePrincipal.remainingPayments[0]?.interest || 0;
  };

  const getRemainingInstallments = () => {
    if (!loanStatusUpdatePrincipal?.remainingPayments) return 0;
    return loanStatusUpdatePrincipal.remainingPayments.length;
  };

  const getTotalRemainingAmount = () => {
    console.log("loanStatusUpdatePrincipal.remainingPayments: ", loanStatusUpdatePrincipal?.remainingPayments);
    if (!loanStatusUpdatePrincipal?.remainingPayments) return 0;
    return loanStatusUpdatePrincipal?.remainingPayments[0]?.remaining_balance || 0;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleLoanChange = (loanId: string) => {
    form.setValue('loan', loanId);
    form.setValue('different_payment', false);
    handleFormChange();
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900' />
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      <div className='bg-white p-6 rounded-lg shadow'>
        <h2 className='text-xl font-bold mb-6'>Registrar Pago de Préstamo</h2>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            onKeyDown={handleKeyDown}
            className='space-y-6'
          >
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

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name='loan'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Préstamo</FormLabel>
                      <Select
                        onValueChange={(value) => handleLoanChange(value)}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Seleccionar préstamo' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loans
                            .filter((loan) => loan.status === 'PAID')
                            .map((loan) => (
                              <SelectItem
                                key={loan.id}
                                value={loan.id}
                              >
                                {`${loan.loan_type} - ${loan.amount} soles - ${loan.number_of_installments} cuotas`}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {!isCuotaVariable && (
                  <FormField
                    control={form.control}
                    name='different_payment'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md'>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className='space-y-1 leading-none'>
                          <FormLabel>Pago Diferente</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name='capital_payment'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuota pago de capital</FormLabel>
                    <FormControl>
                      <EnhancedInputAmount
                        {...field}
                        value={
                          field.value || getNextPaymentPrincipal().toFixed(2)
                        }
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          field.onChange(Number(e.target.value))
                        }
                        disabled={
                          !isCuotaVariable && !form.watch('different_payment')
                        }
                        isDifferentPayment={form.watch('different_payment')}
                        isCuotaVariable={isCuotaVariable}
                        className={
                          !isCuotaVariable && !form.watch('different_payment')
                            ? 'bg-gray-100'
                            : ''
                        }
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
                        value={field.value || getNextPaymentInterest()}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={!form.watch('different_payment')}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {loanStatusUpdatePrincipal && (
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <Card className='p-4'>
                  <CardContent className='pt-4'>
                    <div className='text-sm text-gray-500 mb-1'>
                      Cuotas pendientes
                    </div>
                    <div className='text-2xl font-semibold'>
                      {getRemainingInstallments()}
                    </div>
                  </CardContent>
                </Card>

                <Card className='p-4'>
                  <CardContent className='pt-4'>
                    <div className='text-sm text-gray-500 mb-1'>
                      Saldo pendiente de pago
                    </div>
                    <div className='text-2xl font-semibold'>
                      S/. {getTotalRemainingAmount().toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card className='p-4'>
                  <CardContent className='pt-4'>
                    <div className='text-sm text-gray-500 mb-1'>
                      Monto proxima cuota
                    </div>
                    <div className='text-2xl font-semibold'>
                      S/. {getNextPaymentAmount().toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Button
              type='button'
              className='w-auto bg-black text-white'
              disabled={isLoading}
              onClick={form.handleSubmit(onSubmit)}
            >
              {isLoading ? 'Procesando...' : 'Registrar Pago'}
            </Button>
          </form>
        </Form>

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
                    <TableCell>0.00</TableCell>
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
        </div>
      </div>
    </div>
  );
}
