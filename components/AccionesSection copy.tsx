import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useError } from '@/hooks/useError';
import { api } from '@/utils/api';

interface Member {
  id: number;
  full_name: string;
}

interface AccionPurchase {
  id: number;
  member: string;
  date: string;
  quantity: number;
  value: number;
  member_name: string;
}

const formSchema = z.object({
  member: z.string().min(1, { message: 'Add correct value' }),
  date: z.date(),
  quantity: z.number().min(1, { message: 'Quantity must be at least 1' }),
  value: z.number().min(0, { message: 'Value must be non-negative' }),
});

type FormValues = z.infer<typeof formSchema>;

interface AccionesSectionProps {
  juntaId: string;
}

export default function AccionesSection({ juntaId }: AccionesSectionProps) {
  const { perro, setError } = useError();
  const [history, setHistory] = useState<AccionPurchase[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      member: '',
      date: new Date(),
      quantity: 0,
      value: 0,
    },
  });

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<AccionPurchase[]>(
        `acciones/junta/${juntaId}`
      );
      setHistory(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching members:', error);
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

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<Member[]>(`members/junta/${juntaId}`);
      setMembers(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching members:', error);
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

  useEffect(() => {
    fetchMembers();
    fetchHistory();
  }, [juntaId]);

  const onSubmit = async (values: FormValues) => {
    try {
      const jsonBody = {
        type: 'COMPRA',
        amount: values.quantity,
        description: `Compra de acciones por ${
          values.quantity
        } acciones el dia ${format(values.date, 'yyyy-MM-dd')}`,
        juntaId: juntaId,
        memberId: values.member,
      };

      await api.post('acciones', jsonBody);
      await fetchHistory();

      toast({
        title: 'Success',
        description: 'Acciones purchased successfully',
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

  const handleDeleteAccion = async (accionId: number) => {
    try {
      await api.delete(`acciones/${accionId}`);
      await fetchHistory();

      toast({
        title: 'Success',
        description: 'Accion deleted successfully',
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='space-y-8'>
      <Card>
        <CardHeader>
          <CardTitle>Comprar Acciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='member'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Miembro</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Seleccionar miembro' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {members.length > 0 ? (
                          members.map((member) => (
                            <SelectItem
                              key={member.id}
                              value={member.id.toString()}
                            >
                              {member.full_name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem
                            value='No hay miembros'
                            disabled
                          >
                            No hay miembros
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='date'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Fecha de Movimiento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value && 'text-muted-foreground'
                            }`}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='quantity'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad de Acciones</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        {...field}
                        value={field.value || ''}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='value'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor en Soles</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        {...field}
                        value={field.value || ''}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type='submit'>Comprar Acciones</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Compra de Acciones</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Miembro</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cantidad de Acciones</TableHead>
                  <TableHead>Valor en Soles</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.member_name}</TableCell>
                    <TableCell>
                      {/* {format(new Date(item.date), 'dd/MM/yyyy')} */}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>S/{item.value}</TableCell>
                    <TableCell>
                      <Button
                        variant='destructive'
                        onClick={() => handleDeleteAccion(item.id)}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div>No hay historial de acciones disponible.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}