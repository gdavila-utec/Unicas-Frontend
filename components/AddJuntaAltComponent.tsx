'use client';
import React, { useState } from 'react';

import { useAuth } from '../hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
// import { useAuth } from '../hooks/useAuth';

interface AddJuntaComponentProps {
  onJuntaAdded: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  fecha_inicio: z.date(),
  centro_poblado: z.string().min(1, 'El centro poblado es requerido'),
  distrito: z.string().min(1, 'El distrito es requerido'),
  provincia: z.string().min(1, 'La provincia es requerida'),
  departamento: z.string().min(1, 'El departamento es requerido'),
  latitud: z.string().min(1, 'La latitud es requerida'),
  longitud: z.string().min(1, 'La longitud es requerida'),
});

export const AddJuntaComponent = ({
  onJuntaAdded,
  open,
  onOpenChange,
}: AddJuntaComponentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fecha_inicio: new Date(),
      name: '',
      centro_poblado: '',
      distrito: '',
      provincia: '',
      departamento: '',
      latitud: '0',
      longitud: '0',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const formattedDate = format(values.fecha_inicio, 'yyyy-MM-dd');
      const response = await fetch('/api/juntas/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          fecha_inicio: formattedDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create junta');
      }

      onJuntaAdded();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating junta:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='sm:max-w-[525px] bg-white rounded-xl shadow-2xl text-black'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold text-gray-800'>
            Crear Nueva Única
          </DialogTitle>
          <DialogDescription className='text-gray-600'>
            Ingrese los detalles para crear una nueva única.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <div className='grid grid-cols-2 gap-4'>
              {/* First row */}
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Ingrese el nombre'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='fecha_inicio'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de inicio de operaciones</FormLabel>
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

              {/* Second row */}
              <FormField
                control={form.control}
                name='centro_poblado'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Centro poblado</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Centro poblado'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='distrito'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distrito</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Distrito'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Third row */}
              <FormField
                control={form.control}
                name='provincia'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provincia</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Provincia'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='departamento'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Departamento'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fourth row */}
              <FormField
                control={form.control}
                name='latitud'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitud</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        step='0.000001'
                        placeholder='0'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='longitud'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitud</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        step='0.000001'
                        placeholder='0'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className='space-x-4 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type='submit'
                disabled={isLoading}
                className='bg-black text-white hover:bg-gray-800'
              >
                {isLoading ? 'Creando...' : 'Crear Única'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
