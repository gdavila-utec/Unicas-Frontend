// components/Ajustes.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const settingsFormSchema = z.object({
  fecha_asamblea: z.date({
    required_error: 'Fecha de asamblea es requerida',
  }),
  porcentaje_intereses: z.string().min(1, 'Porcentaje es requerido'),
  valor_multa_inasistencia: z.string().min(1, 'Valor es requerido'),
  valor_formulario_prestamo: z.string().min(1, 'Valor es requerido'),
  valor_accion: z.string().min(1, 'Valor es requerido'),
  valor_multa_tardanza: z.string().min(1, 'Valor es requerido'),
  porcentaje_mora: z.string().min(1, 'Porcentaje es requerido'),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export const Ajustes = () => {
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      fecha_asamblea: new Date(),
      porcentaje_intereses: '',
      valor_multa_inasistencia: '',
      valor_formulario_prestamo: '',
      valor_accion: '',
      valor_multa_tardanza: '',
      porcentaje_mora: '',
    },
  });

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      // API call here
      toast({
        title: 'Ajustes guardados',
        description: 'Los ajustes han sido actualizados exitosamente.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron guardar los ajustes.',
      });
    }
  };

  return (
    <Card className='w-full max-w-4xl mx-auto'>
      <CardHeader>
        <CardTitle>Ajustes de la Junta</CardTitle>
        <CardDescription>
          Configura los parámetros generales de la junta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6'
          >
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Fecha de asamblea */}
              <FormField
                control={form.control}
                name='fecha_asamblea'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Fecha de asamblea</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            className={`w-full justify-start text-left font-normal ${
                              !field.value && 'text-muted-foreground'
                            }`}
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

              {/* Valor de la acción */}
              <FormField
                control={form.control}
                name='valor_accion'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor de la acción</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* % de intereses mensuales */}
              <FormField
                control={form.control}
                name='porcentaje_intereses'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>% de intereses mensuales</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Valor de multa por tardanza */}
              <FormField
                control={form.control}
                name='valor_multa_tardanza'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor de multa por tardanza</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Valor de multa por inasistencia */}
              <FormField
                control={form.control}
                name='valor_multa_inasistencia'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor de multa por inasistencia</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* % de interés por mora */}
              <FormField
                control={form.control}
                name='porcentaje_mora'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>% de interés por mora</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Valor del formulario de préstamo */}
              <FormField
                control={form.control}
                name='valor_formulario_prestamo'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor del formulario de préstamo</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type='submit'
              className='bg-black text-white hover:bg-gray-800'
            >
              Guardar Ajustes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};