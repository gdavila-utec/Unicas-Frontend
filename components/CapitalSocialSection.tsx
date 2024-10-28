import { Button } from '@/components/ui/button';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface CapitalData {
  reserva_legal: number;
  fondo_social: number;
  id: number;
}

const addCapitalSchema = z.object({
  type: z.enum(['Reserva Legal', 'Fondo Social']),
  amount: z.number().min(0, 'El monto debe ser positivo'),
  description: z.string().optional(),
});

const registerExpenseSchema = z.object({
  type: z.enum(['Reserva Legal', 'Fondo Social']),
  amount: z.number().min(0, 'El monto debe ser positivo'),
  description: z.string().min(1, 'La descripción es requerida'),
});

export default function CapitalSocialSection({ juntaId }: { juntaId: string }) {
  const [capitalData, setCapitalData] = useState<CapitalData>();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true); // Loading state

  const addCapitalForm = useForm<z.infer<typeof addCapitalSchema>>({
    resolver: zodResolver(addCapitalSchema),
    defaultValues: {
      type: 'Reserva Legal',
      amount: 0,
      description: '',
    },
  });

  const registerExpenseForm = useForm<z.infer<typeof registerExpenseSchema>>({
    resolver: zodResolver(registerExpenseSchema),
    defaultValues: {
      type: 'Reserva Legal',
      amount: 0,
      description: '',
    },
  });
  const fetchCapitalData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/capital/social/junta/${juntaId}`);
      if (response.ok) {
        const data = await response.json();
        setCapitalData(data);
      }
    } catch (error) {
      console.error('Error fetching capital data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCapitalData();
  }, [juntaId]);

  const onAddCapital = async (values: z.infer<typeof addCapitalSchema>) => {
    try {
      if (!capitalData) {
        return;
      }
      const response = await fetch(`/capital/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: values.amount,
          juntaId: juntaId,
        }),
      });

      if (response.ok) {
        await fetchCapitalData();
        addCapitalForm.reset();
        toast({
          title: 'Capital añadido',
          description: 'El capital se ha añadido exitosamente.',
        });
      } else {
        throw new Error('Failed to add capital');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Hubo un problema al añadir el capital.',
        variant: 'destructive',
      });
    }
  };

  const onRegisterExpense = async (
    values: z.infer<typeof registerExpenseSchema>
  ) => {
    try {
      const response = await fetch(`/api/juntas/${juntaId}/capital/expense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capital_social: capitalData!.id,
          ...values,
        }),
      });

      if (response.ok) {
        await fetchCapitalData();
        registerExpenseForm.reset();
        toast({
          title: 'Gasto registrado',
          description: 'El gasto se ha registrado exitosamente.',
        });
      } else {
        throw new Error('Failed to register expense');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Hubo un problema al registrar el gasto.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>; // Loading message
  }

  return (
    <Card className='w-full max-w-4xl mx-auto'>
      <CardHeader>
        <CardTitle>Gestión de Capital Social</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div>
          <h3 className='text-lg font-semibold'>Capital Actual</h3>
          {capitalData ? (
            <>
              <p>Reserva Legal: S/{capitalData.reserva_legal}</p>
              <p>Fondo Social: S/{capitalData.fondo_social}</p>
            </>
          ) : (
            <p>No capital data available</p>
          )}
        </div>
        <Form {...addCapitalForm}>
          <form
            onSubmit={addCapitalForm.handleSubmit(onAddCapital)}
            className='space-y-4'
          >
            <FormField
              control={addCapitalForm.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Añadir Capital</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Seleccionar tipo' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='Reserva Legal'>
                        Reserva Legal
                      </SelectItem>
                      <SelectItem value='Fondo Social'>Fondo Social</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={addCapitalForm.control}
              name='amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                      value={field.value === 0 ? '' : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit'>Añadir</Button>
          </form>
        </Form>

        <Form {...registerExpenseForm}>
          <form
            onSubmit={registerExpenseForm.handleSubmit(onRegisterExpense)}
            className='space-y-4'
          >
            <FormField
              control={registerExpenseForm.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registrar Gasto</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Seleccionar tipo' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='Reserva Legal'>
                        Reserva Legal
                      </SelectItem>
                      <SelectItem value='Fondo Social'>Fondo Social</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={registerExpenseForm.control}
              name='amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                      value={field.value === 0 ? '' : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={registerExpenseForm.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit'>Registrar Gasto</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
