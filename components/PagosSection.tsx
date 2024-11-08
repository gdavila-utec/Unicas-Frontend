import React, { useState, useEffect, useCallback, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CalendarIcon } from 'lucide-react';
import { format, set } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { api } from '@/utils/api';
import { useError } from '@/hooks/useError';
import {
  Pago,
  PagoItem,
  FormattedPago,
  LoanStatus,
  Payment,
  PaymentHistory,
  Prestamo,
} from '@/types';
import { useCapitalStore } from '@/store/useCapitalStore';
import { useJuntaStore } from '@/store/juntaValues';

const formSchema = z.object({
  date: z.date(),
  member: z.string().min(1, { message: 'Por favor seleccione un socio' }),
  loan: z.string().min(1, { message: 'Por favor seleccione un préstamo' }),
  capital_payment: z.number().min(0, { message: 'Ingrese un monto válido' }),
  interest_payment: z.number().min(0, { message: 'Ingrese un monto válido' }),
  is_late_payment: z.boolean().default(false),
  different_payment: z.boolean().default(false),
  checkValue: z.boolean().default(false),
});

export default function PagosSection({ juntaId }: { juntaId: string }) {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loans, setLoans] = useState<Prestamo[]>([]);
  console.log('loans: ', loans);
  const [history, setHistory] = useState<PaymentHistory[]>([]);
  console.log('history: ', history);
  const [loanStatus, setLoanStatus] = useState<LoanStatus | unknown>(null);
  const [remainingInstallmentsInfo, setRemainingInstallmentsInfo] = useState<
    Payment[]
  >([]);
  const [checkValue, setCheckValue] = useState<boolean>(false);
  const [formatPagos, setFormatPagos] = useState<FormattedPago[]>([]);
  const [prestamoId, setPrestamoId] = useState<string>('');
  const { toast } = useToast();
  const { perro, setError } = useError();
  const { updateAvailableCapital } = useCapitalStore();
  const { setSelectedJunta, getJuntaById } = useJuntaStore();
  const junta = getJuntaById(juntaId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      member: '',
      loan: '',
      capital_payment: 0,
      interest_payment: 0,
      is_late_payment: false,
      different_payment: false,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await handleGetMembers();
      await fetchLoans();
      await fetchHistory();
      updateAvailableCapital(junta);
      setIsLoading(false);
    };
    fetchData();
  }, [juntaId]);

  const handleGetMembers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/members/junta/${juntaId}`);
      setMembers(response);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error);
      toast({
        title: 'Error',
        description: perro,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/prestamos/junta/${juntaId}`);
      setLoans(response);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error);
      toast({
        title: 'Error',
        description: perro,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRemainingInstallmentsInfo = async (prestamoId: string) => {
    setIsLoading(true);
    try {
      const response = await api.get(
        `prestamos/${prestamoId}/remaining-payments`
      );
      setLoanStatus(response);
    } catch (error) {
      setError(error);
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: perro,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`junta-payments/${juntaId}/history`);
      console.log('pagos history response: ', response);
      setHistory(response);
    } catch (error) {
      setError(error);
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: perro,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (loanStatus) {
      const loanStatusCheck = loanStatus as LoanStatus;
      setRemainingInstallmentsInfo(loanStatusCheck.remainingPayments);
    }
  }, [loanStatus]);

  const handleFormChange = () => {
    const memberId = form.getValues('member');
    const loanId = form.getValues('loan');
    const filteredLoansByMember = loans.filter(
      (loan: { memberId: string }) => loan.memberId === memberId
    );
    setPrestamoId(loanId);
    setLoans(filteredLoansByMember);
    if (loanId) {
      fetchRemainingInstallmentsInfo(loanId);
    }
  };

  const handleCuotaCheck = (installment: Payment) => {
    if (installment) {
      form.setValue(
        'capital_payment',
        parseFloat(installment.principal.toFixed(2))
      );
      form.setValue(
        'interest_payment',
        parseFloat(installment.interest.toFixed(2))
      );
      if (installment.id !== remainingInstallmentsInfo[0].id) {
        toast({
          title: 'pago cuota',
          description:
            'solo puede seleccionar la cuota que le corresponde pagar antes de poder pagar otras cuotas',
        });
      }
    }
  };

  const handleDeletePago = async (id: string) => {
    setIsLoading(true);
    try {
      await api.delete(`prestamos/pagos/${id}`);
      await fetchHistory();
      toast({
        title: 'Pago eliminado',
        description: 'El pago se ha eliminado exitosamente.',
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error);
      toast({
        title: 'Error',
        description: perro,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const amount = values.capital_payment + values.interest_payment;
      const response = await api.post(`prestamos/${prestamoId}/pagos`, {
        amount: amount,
      });
      await fetchHistory();
      form.reset();
      toast({
        title: 'Pago registrado',
        description: 'El pago se ha registrado exitosamente.',
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error);
      toast({
        title: 'Error',
        description: perro,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                        {members.map((member) => (
                          <SelectItem
                            key={member.id}
                            value={member.id.toString()}
                          >
                            {member.full_name}
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
                            {format(field.value, 'dd/MM/yyyy')}
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

            <div className='grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-6'>
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
                            {loan.loan_number} - {loan.loan_code} -{' '}
                            {loan.loan_type} - {loan.amount} soles -{' '}
                            {loan.number_of_installments} cuotas
                            {/* { loan.} {loan.amount} soles - {loan.request_date} */}
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
                    <FormLabel>Monto pago de capital</FormLabel>
                    <FormControl>
                      <Input
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
                      <Input
                        type='number'
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className='space-y-4 flex gap-20 ml-1'>
              <div className='flex space-x-6 items-center'>
                <FormField
                  control={form.control}
                  name='is_late_payment'
                  render={({ field }) => (
                    <FormItem className='flex items-center space-x-2'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <Label>Mora</Label>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='different_payment'
                  render={({ field }) => (
                    <FormItem className='flex items-center space-x-2'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <Label>Pago diferente</Label>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div>
              <div className='p-4'>
                <div className='font-semibold mb-3 mb-5 text-md'>
                  Cuotas a pagar
                </div>
                <div>
                  <div className='grid grid-cols-11 text-xs md:text-sm mb-5 font-medium'>
                    <p className='text-left w-10'>Cuota</p>
                    <p className='w-5'></p>
                    <p className='text-left w-20 min-w-[128px]'>Fecha</p>
                    <p className='w-10 '></p>
                    <p className='text-center w-10'>Monto</p>
                    <p className='w-5'></p>
                    <p className='text-right w-10'>Interes</p>
                    <p className='w-5'></p>
                    <p className='text-left w-40'>Pago de capital</p>
                    <p className='text-right'></p>
                  </div>
                  {remainingInstallmentsInfo
                    .filter((item, index) => {
                      // Handle the first item
                      if (index === 0) return true;

                      // Compare with previous item's installment number
                      const previousItem = remainingInstallmentsInfo[index - 1];
                      return (
                        item.installment_number !==
                        previousItem.installment_number
                      );
                    })
                    .map((installment: Payment) => (
                      <div
                        key={installment.id}
                        className='grid grid-cols-11 text-xs md:text-sm py-4 border-b border-gray-100 overflow-x-auto '
                      >
                        <p className=' text-center w-5'>
                          {installment.installment_number}
                        </p>
                        <p className='w-5'></p>
                        <p className='text-left min-w-[64px] text-xs md:text-sm  w-10 mr-10'>
                          {format(new Date(installment.due_date), 'dd/MM/yyyy')}
                        </p>
                        <p className='w-20 min-w-[128px] ml-10'></p>
                        <p className='text-center w-10 '>
                          {installment.expected_amount.toFixed(2)}
                        </p>
                        <p className='w-5 '></p>
                        <p className='text-right w-10'>
                          {installment.interest.toFixed(2)}
                        </p>
                        <p className='w-5'></p>
                        <p className='text-right w-10'>
                          {installment.principal.toFixed(2)}
                        </p>
                        <p className='w-5'></p>
                        <p className='text-left w-10 '>
                          <FormField
                            control={form.control}
                            key={installment.id}
                            name='checkValue'
                            render={({ field }) => {
                              return (
                                <FormControl
                                  onInvalid={() => console.log('invalid')}
                                >
                                  <Checkbox
                                    onLoad={() => console.log('onload')}
                                    name={installment.id}
                                    checked={field.value}
                                    onCheckedChange={() => {
                                      handleCuotaCheck(installment);
                                    }}
                                    onInvalid={() => console.log('invalid')}
                                  />
                                </FormControl>
                              );
                            }}
                          />
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <Button
              type='submit'
              className='w-auto'
            >
              Registrar Pago
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {history &&
                history.map((payment, index) => (
                  <TableRow key={payment.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{payment.prestamo.member.full_name}</TableCell>
                    <TableCell>
                      {format(new Date(payment.date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className='align-left'>
                      {payment.principal_paid.toFixed(2)}
                    </TableCell>
                    <TableCell>{payment.interest_paid.toFixed(2)}</TableCell>
                    <TableCell>{0}</TableCell>
                    <TableCell>{payment.amount.toFixed(2)}</TableCell>
                    <TableCell>{payment.remaining_amount.toFixed(2)}</TableCell>
                    <TableCell>{payment.remaining_installments}</TableCell>
                    <TableCell>{payment.prestamo.status}</TableCell>
                    <TableCell>
                      <Button
                        variant='destructive'
                        onClick={() => handleDeletePago(payment.id)}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
