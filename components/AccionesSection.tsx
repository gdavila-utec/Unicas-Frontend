import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useError } from '@/hooks/useError';
import { api, handleApiError } from '@/utils/api';
import { Accion, Member, Junta } from '@/types';
import { useBoardConfig } from '@/store/configValues';
import { useAccionesStore } from '@/store/accionesStore';
import { useJuntaStore } from '@/store/juntaValues';
import { useMemberStore } from '@/store/memberStore';
import { useCapitalStore } from '@/store/useCapitalStore';

interface AccionesSectionProps {
  juntaId: string;
}

const formSchema = z.object({
  memberId: z.string().min(1, { message: 'Miembro requerido' }),
  date: z.date(),
  amount: z.number().min(1, { message: 'La cantidad debe ser mayor a 0' }),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AccionesSection({ juntaId }: AccionesSectionProps) {
  const { perro, setError } = useError();
  const [loading, setIsLoading] = useState(false);
  const { getJuntaAcciones, setAcciones } = useAccionesStore();
  const { setSelectedJunta } = useJuntaStore();
  const { getJuntaMembers } = useMemberStore();
  const members = useMemo(() => getJuntaMembers() ?? [], [getJuntaMembers]);
  const acciones = useMemo(
    () => getJuntaAcciones(juntaId),
    [getJuntaAcciones, juntaId]
  );
  const { updateAvailableCapital } = useCapitalStore();
  const { toast } = useToast();
  const {
    shareValue,
    meetingDate,
    monthlyInterestRate,
    latePaymentFee,
    absenceFee,
    defaultInterestRate,
    loanFormValue,
  } = useBoardConfig();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberId: '',
      date: new Date(),
      amount: 0,
      description: '',
    },
  });

  const fetchAcciones = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<Accion[]>(`acciones/junta/${juntaId}`);
      setAcciones(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching acciones:', error);
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

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch acciones
      const response = await api.get<Accion[]>(`acciones/junta/${juntaId}`);
      setAcciones(Array.isArray(response) ? response : []);

      // Fetch junta
      const juntaData = await api.get(`juntas/${juntaId}`);
      console.log('juntaData: ', juntaData);

      // Update fondo social
      updateAvailableCapital(juntaData);
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
  }, [juntaId, setAcciones, setSelectedJunta, setError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch juntas when view is set to admin

  // const fetchMembers = async () => {
  //   setIsLoading(true);
  //   try {
  //     const response = await api.get<Member[]>(`members/junta/${juntaId}`);
  //     setMembers(Array.isArray(response) ? response : []);
  //   } catch (error) {
  //     console.error('Error fetching members:', error);
  //     setError(error);
  //     toast({
  //       title: 'Error',
  //       description: perro,
  //       variant: 'destructive',
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchMembers();
  //   fetchAcciones();
  // }, [juntaId]);

  const onSubmit = async (values: FormValues) => {
    try {
      const jsonBody: Partial<Accion> = {
        type: 'COMPRA',
        amount: values.amount,
        shareValue: shareValue,
        description: `Compra de acciones por ${
          values.amount
        } acciones el dia ${format(values.date, 'yyyy-MM-dd')}`,
        juntaId: juntaId,
        memberId: values.memberId,
      };

      await api.post('acciones', jsonBody);
      await fetchData();

      toast({
        title: 'Success',
        description: 'Acciones compradas exitosamente',
      });

      form.reset();
    } catch (error) {
      console.error('Error adding accion:', error);
      setError(error);
      toast({
        title: 'Error',
        description: perro,
        variant: 'destructive',
      });
    }
  };

  if (loading) return <div>Loading...</div>;

  const handleDeleteAcciones = async (id: string) => {
    try {
      await api.delete(`acciones/${id}`);
      await fetchData();

      toast({
        title: 'Success',
        description: 'Accion eliminada exitosamente',
      });
    } catch (error) {
      console.error('Error deleting accion:', error);
      setError(error);
      toast({
        title: 'Error',
        description: perro,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='space-y-8 p-6'>
      <div>
        <h1 className='text-2xl font-semibold mb-6'>Comprar Acciones</h1>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6'
          >
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <FormField
                control={form.control}
                name='memberId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700'>
                      Seleccionar Miembro
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className='h-10'>
                          <SelectValue placeholder='Seleccionar miembro' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {members
                          .filter(
                            (member) => member.user.member_role === 'socio'
                          )
                          .map((member) => (
                            <SelectItem
                              key={member.id}
                              value={member.user.id}
                            >
                              {member.user.full_name ||
                                member.user.username ||
                                'Usuario sin nombre'}
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
                    <FormLabel className='text-gray-700'>Fecha</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            className='h-10 w-full justify-start text-left font-normal'
                          >
                            {field.value
                              ? format(field.value, 'dd/MM/yyyy')
                              : 'Seleccionar fecha'}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className='w-auto p-0'
                        align='start'
                      >
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700'>
                      Cantidad de Acciones
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        {...field}
                        value={field.value || ''}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 0)
                        }
                        className='h-10'
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700'>
                      Valor de Acciones
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        {...field}
                        value={shareValue}
                        className='h-10'
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button
              type='submit'
              className='bg-black text-white'
            >
              Comprar Acciones
            </Button>
          </form>
        </Form>
      </div>

      <div>
        <h2 className='text-xl font-semibold mb-4'>
          Historial de Compras de Acciones
        </h2>
        {acciones.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-12'>N°</TableHead>
                <TableHead>Nombre completo (socio)</TableHead>
                <TableHead>Fecha de compra</TableHead>
                <TableHead>Cantidad (#)</TableHead>
                <TableHead>Valor Total (S/.)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {acciones.map((accion, index) => (
                <TableRow key={accion.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {accion.member.full_name || accion.member.username}
                  </TableCell>
                  <TableCell>
                    {format(new Date(accion.createdAt), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{accion.amount}</TableCell>
                  <TableCell>{accion.amount * shareValue}</TableCell>
                  <TableCell>
                    <Button
                      variant='destructive'
                      onClick={() => handleDeleteAcciones(accion.id)}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell
                  colSpan={3}
                  className='font-semibold'
                >
                  Total
                </TableCell>
                <TableCell className='font-semibold'>
                  {acciones.reduce((sum, accion) => sum + accion.amount, 0)}
                </TableCell>
                <TableCell className='font-semibold'>
                  {acciones.reduce(
                    (sum, accion) => sum + accion.amount * shareValue,
                    0
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          <div className='text-center py-4 text-gray-500'>
            No hay historial de acciones disponible.
          </div>
        )}
      </div>
    </div>
  );
}
