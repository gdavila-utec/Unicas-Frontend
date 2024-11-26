import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import EnhancedInputAmount from '@/components/ui/enhanced-input-amount';
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
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useMultas } from '@/hooks/useMultasSection';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useBoardConfig } from '@/store/configValues';

interface MultasSectionProps {
  juntaId: string;
}

export const MultasSection: React.FC<MultasSectionProps> = ({ juntaId }) => {
  const { form, members, multas, isLoading, onSubmit, handleDeleteMulta } =
    useMultas(juntaId);
  const { absenceFee, latePaymentFee } = useBoardConfig();

  

  if (isLoading) {
    return (
      <div className='flex justify-center items-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900' />
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      <Card>
        <CardHeader>
          <CardTitle>Registrar Multa</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4'
            >
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='memberId'
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
                          {members
                            .filter((member) => member.role === 'USER')
                            .map((member) => (
                              <SelectItem
                                key={member.id}
                                value={member.id}
                              >
                                {member.full_name || member.username}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='reason'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Set the amount based on the selected reason
                          if (value === 'INASISTENCIA') {
                            form.setValue('amount', absenceFee);
                          } else if (value === 'TARDANZA') {
                            form.setValue('amount', latePaymentFee);
                          } else {
                            // For 'OTROS', you might want to clear the amount or keep it unchanged
                            form.setValue('amount', 0);
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Seleccionar motivo' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='TARDANZA'>Tardanza</SelectItem>
                          <SelectItem value='INASISTENCIA'>
                            Inasistencia
                          </SelectItem>
                          <SelectItem value='OTROS'>Otros</SelectItem>
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
                    <FormItem>
                      <FormLabel>Fecha</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant='outline'
                              className='w-full justify-start text-left font-normal'
                            >
                              {field.value ? (
                                format(field.value, 'dd/MM/yyyy')
                              ) : (
                                <span>Seleccionar fecha</span>
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
                  name='amount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto</FormLabel>
                      <FormControl>
                        <EnhancedInputAmount
                          type='number'
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          disabled={
                            form.getValues('reason') === 'OTROS' ? false : true
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='comments'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comentarios (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type='submit'
                disabled={isLoading}
              >
                {isLoading ? 'Registrando...' : 'Registrar Multa'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Multas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N°</TableHead>
                <TableHead>Nombre completo (socio)</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Comentarios</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {multas.length > 0 ? (
                multas.map((multa, index) => (
                  <TableRow key={multa.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{multa.member?.full_name}</TableCell>
                    <TableCell>
                      {format(new Date(multa.createdAt), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>{multa.description}</TableCell>
                    <TableCell>{'-'}</TableCell>
                    <TableCell>S/.{multa.amount}</TableCell>
                    <TableCell>
                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => handleDeleteMulta(multa.id)}
                        disabled={isLoading}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className='text-center text-muted-foreground'
                  >
                    No hay multas registradas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultasSection;
