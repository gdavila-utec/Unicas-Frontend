'use client';
import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAddJunta } from '@/hooks/useAddJunta';

interface AddJuntaComponentProps {
  onJuntaAdded: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddJuntaComponent: React.FC<AddJuntaComponentProps> = ({
  onJuntaAdded,
  open,
  onOpenChange,
}) => {
  const { form, isLoading, onSubmit } = useAddJunta({
    onJuntaAdded,
    onOpenChange,
  });

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
            onSubmit={onSubmit}
            className='space-y-4'
          >
            <div className='grid grid-cols-2 gap-4'>
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
