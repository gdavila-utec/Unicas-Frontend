import React from 'react';
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
  SelectGroup,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useAccionesSection } from '@/hooks/useAccionesSection';

interface AccionesSectionProps {
  juntaId: string;
}

export default function AccionesSection({ juntaId }: AccionesSectionProps) {
  const {
    form,
    acciones,
    members,
    isLoading,
    shareValue,
    onSubmit,
    handleDeleteAcciones,
    totalShares,
    totalValue,
  } = useAccionesSection(juntaId);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900' />
      </div>
    );
  }

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
                        <SelectTrigger>
                          <SelectValue placeholder='Seleccionar miembro' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {members.length > 0 ? (
                            members
                              .filter(
                                (member) => member.member_role === 'socio'
                              )
                              .map((member) => (
                                <SelectItem
                                  key={member.id}
                                  value={member.id}
                                >
                                  {member.full_name}
                                </SelectItem>
                              ))
                          ) : (
                            <SelectItem
                              value='no-members'
                              disabled
                            >
                              No hay miembros disponibles
                            </SelectItem>
                          )}
                        </SelectGroup>
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

              <div>
                <FormLabel className='text-gray-700'>
                  Valor de Acciones
                </FormLabel>
                <Input
                  type='number'
                  value={shareValue}
                  disabled
                  className='h-10'
                />
              </div>
            </div>

            <Button
              type='submit'
              className='bg-black text-white'
              disabled={isLoading}
            >
              {isLoading ? 'Procesando...' : 'Comprar Acciones'}
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
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {acciones.map((accion, index) => (
                <TableRow key={accion.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {accion.member?.full_name || 'No disponible'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(accion.createdAt), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{accion.amount}</TableCell>
                  <TableCell>
                    S/.{(accion.amount * shareValue).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={() => handleDeleteAcciones(accion.id)}
                      disabled={isLoading}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell>{totalShares}</TableCell>
                <TableCell>S/.{totalValue.toFixed(2)}</TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
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
