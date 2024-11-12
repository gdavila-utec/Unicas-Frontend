import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';

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

type FormData = z.infer<typeof formSchema>;

interface UseAddJuntaProps {
  onJuntaAdded: () => void;
  onOpenChange: (open: boolean) => void;
}

export const useAddJunta = ({
  onJuntaAdded,
  onOpenChange,
}: UseAddJuntaProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
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

  const createJuntaMutation = useMutation({
    mutationFn: async (values: FormData) => {
      const formattedDate = format(values.fecha_inicio, 'yyyy-MM-dd');
      const payload = {
        ...values,
        fecha_inicio: formattedDate,
      };

      return api.post('juntas', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juntas'] });
      toast({
        title: 'Éxito',
        description: 'Junta creada correctamente',
      });
      onJuntaAdded();
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Error al crear la junta',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (values: FormData) => {
    await createJuntaMutation.mutateAsync(values);
  };

  return {
    form,
    isLoading: createJuntaMutation.isPending,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
