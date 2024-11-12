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
import { InputAmount } from '@/components/ui/input-amount';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useBoardConfig } from '@/store/configValues';
import DaySelect from '@/components/ui/dayselect';

const settingsFormSchema = z.object({
  fecha_asamblea: z.number({
    required_error: 'Por favor seleccione un día',
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
  const {
    meetingDate,
    monthlyInterestRate,
    absenceFee,
    loanFormValue,
    shareValue,
    latePaymentFee,
    defaultInterestRate,
    setMeetingDate,
    setMonthlyInterestRate,
    setAbsenceFee,
    setLoanFormValue,
    setShareValue,
    setLatePaymentFee,
    setDefaultInterestRate,
  } = useBoardConfig();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      fecha_asamblea: meetingDate,
      porcentaje_intereses: monthlyInterestRate.toString(),
      valor_multa_inasistencia: absenceFee.toString(),
      valor_formulario_prestamo: loanFormValue.toString(),
      valor_accion: shareValue.toString(),
      valor_multa_tardanza: latePaymentFee.toString(),
      porcentaje_mora: defaultInterestRate.toString(),
    },
  });

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      setMeetingDate(data.fecha_asamblea);
      setMonthlyInterestRate(Number(data.porcentaje_intereses));
      setAbsenceFee(Number(data.valor_multa_inasistencia));
      setLoanFormValue(Number(data.valor_formulario_prestamo));
      setShareValue(Number(data.valor_accion));
      setLatePaymentFee(Number(data.valor_multa_tardanza));
      setDefaultInterestRate(Number(data.porcentaje_mora));

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
                    {/* <FormLabel>Dia de asamblea</FormLabel> */}

                    <FormControl>
                      <FormField
                        control={form.control}
                        name='fecha_asamblea'
                        render={({ field }) => <DaySelect field={field} />}
                      />
                    </FormControl>

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
                      {/* <Input
                        type='number'
                        step='5'
                        {...field}
                      /> */}
                      <InputAmount
                        {...field}
                        type='number'
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
                        step='1'
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
                        step='1'
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
                        step='1'
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
