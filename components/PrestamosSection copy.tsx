import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';
import { useBoardConfig } from '@/store/configValues';
import { Prestamo, Member, CreatePrestamoDto } from '@/types';

// interface Member {
//   id: number;
//   full_name: string;
// }

// interface Prestamo {
//   id: number;
//   request_date: string;
//   amount: string;
//   monthly_interest: string;
//   number_of_installments: number;
//   approved: boolean;
//   rejected: boolean;
//   rejection_reason: string;
//   paid: boolean;
//   remaining_amount: string;
//   remaining_installments: number;
//   member: number;
//   member_name: string;
//   junta: number;
//   loan_type: string;
//   status: string;
// }

interface NuevoPrestamoForm {
  miembro: string;
  fechaSolicitud: string;
  montoSolicitado: number;
  interesMensual: number;
  cantidadCuotas: number;
  tipoPrestamo: string;
}

const PrestamosSection = ({ juntaId }: { juntaId: string }) => {
  const { monthlyInterestRate } = useBoardConfig();
  const { toast } = useToast();
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  console.log('prestamos: ', prestamos);
  const [members, setMembers] = useState<Member[]>([]);
  console.log('members: ', members);
  const [isLoading, setIsLoading] = useState(false);
  const [nuevoPrestamoForm, setNuevoPrestamoForm] = useState<NuevoPrestamoForm>(
    {
      miembro: '',
      fechaSolicitud: '',
      montoSolicitado: 0,
      interesMensual: monthlyInterestRate,
      cantidadCuotas: 0,
      tipoPrestamo: 'Cuota a rebatir',
    }
  );

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [membersData, prestamosData] = await Promise.all([
        api.get<Member[]>(`members/junta/${juntaId}`),
        api.get<Prestamo[]>(`prestamos/junta/${juntaId}`),
      ]);
      setMembers(membersData);
      setPrestamos(prestamosData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error al cargar datos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [juntaId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setNuevoPrestamoForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    try {
      // const prestamoData = {
      //   request_date: nuevoPrestamoForm.fechaSolicitud,
      //   amount: nuevoPrestamoForm.montoSolicitado.toString(),
      //   monthly_interest: nuevoPrestamoForm.interesMensual.toString(),
      //   number_of_installments: nuevoPrestamoForm.cantidadCuotas,
      //   remaining_amount: nuevoPrestamoForm.montoSolicitado,
      //   remaining_installments: nuevoPrestamoForm.cantidadCuotas,
      //   member: parseInt(nuevoPrestamoForm.miembro),
      //   junta: parseInt(juntaId),
      //   loan_type: nuevoPrestamoForm.tipoPrestamo,
      // };

      const prestamoData: CreatePrestamoDto = {
        juntaId,
        memberId: nuevoPrestamoForm.miembro,
        request_date: nuevoPrestamoForm.fechaSolicitud,
        amount: nuevoPrestamoForm.montoSolicitado.toString(),
        monthly_interest: nuevoPrestamoForm.interesMensual.toString(),
        number_of_installments: nuevoPrestamoForm.cantidadCuotas,
        loan_type: nuevoPrestamoForm.tipoPrestamo as
          | 'personal'
          | 'negocio'
          | 'emergencia',
        payment_type: 'mensual', // Add this field to your form if needed
        reason: '', // Add this field to your form
        guarantee_type: 'personal', // Add this field to your form
        guarantee_detail: '', // Add this field to your form
        form_purchased: false, // Add this field to your form
      };

      await api.post('prestamos', prestamoData);
      await fetchData();

      setNuevoPrestamoForm({
        miembro: '',
        fechaSolicitud: '',
        montoSolicitado: 0,
        interesMensual: 0,
        cantidadCuotas: 0,
        tipoPrestamo: 'Cuota a rebatir',
      });

      toast({
        title: 'Éxito',
        description: 'Préstamo registrado correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Error al registrar préstamo',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await api.delete(`prestamos/${id}`);
      await fetchData();
      toast({
        title: 'Éxito',
        description: 'Préstamo eliminado correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error al eliminar préstamo',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center p-8'>Cargando...</div>
    );
  }

  return (
    <div className='space-y-8'>
      <Card>
        <CardHeader>
          <h2 className='text-2xl font-bold'>Agregar Préstamo</h2>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className='space-y-4'
          >
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label>Miembro</Label>
                <Select
                  value={nuevoPrestamoForm.miembro}
                  onValueChange={(value) =>
                    handleInputChange({
                      target: { name: 'miembro', value },
                    } as React.ChangeEvent<HTMLSelectElement>)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Seleccionar miembro' />
                  </SelectTrigger>
                  <SelectContent>
                    {members.length > 0 ? (
                      members.map((member) => (
                        <SelectItem
                          key={member.id}
                          value={member.id}
                        >
                          {member.full_name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem
                        value='No members'
                        disabled
                      >
                        No hay socios disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor='fechaSolicitud'>Fecha de Solicitud</Label>
                <Input
                  type='date'
                  id='fechaSolicitud'
                  name='fechaSolicitud'
                  value={nuevoPrestamoForm.fechaSolicitud}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor='montoSolicitado'>Monto Solicitado</Label>
                <Input
                  type='number'
                  id='montoSolicitado'
                  name='montoSolicitado'
                  value={nuevoPrestamoForm.montoSolicitado}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor='interesMensual'>Interés Mensual</Label>
                <Input
                  type='number'
                  id='interesMensual'
                  name='interesMensual'
                  value={nuevoPrestamoForm.interesMensual}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor='cantidadCuotas'>Cantidad de Cuotas</Label>
                <Input
                  type='number'
                  id='cantidadCuotas'
                  name='cantidadCuotas'
                  value={nuevoPrestamoForm.cantidadCuotas}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor='tipoPrestamo'>Tipo de Préstamo</Label>
                <Select
                  value={nuevoPrestamoForm.tipoPrestamo}
                  onValueChange={(value) =>
                    handleInputChange({
                      target: { name: 'tipoPrestamo', value },
                    } as React.ChangeEvent<HTMLSelectElement>)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Seleccionar tipo de préstamo' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Cuota a rebatir'>
                      Cuota a rebatir
                    </SelectItem>
                    <SelectItem value='Cuota fija'>Cuota fija</SelectItem>
                    <SelectItem value='Cuota a vencimiento'>
                      Cuota a vencimiento
                    </SelectItem>
                    <SelectItem value='Cuota variable'>
                      Cuota variable
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type='submit'>Agregar Préstamo</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className='text-2xl font-bold'>Préstamos Activos</h2>
        </CardHeader>
        <CardContent>
          {prestamos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Miembro</TableHead>
                  <TableHead>Monto Original</TableHead>
                  <TableHead>Monto Adeudado</TableHead>
                  <TableHead>Cuotas Pendientes</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Opciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prestamos.map((prestamo) => (
                  <TableRow key={prestamo.id}>
                    <TableCell>{prestamo.member.full_name}</TableCell>
                    <TableCell>S/.{prestamo.amount}</TableCell>
                    <TableCell>S/.{prestamo.remaining_amount}</TableCell>
                    <TableCell>{prestamo.number_of_installments}</TableCell>
                    <TableCell>{prestamo.status}</TableCell>
                    <TableCell>
                      <div className='flex space-x-2'>
                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={() => handleDelete(prestamo.id)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className='text-center py-4'>
              No hay préstamos registrados.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PrestamosSection;
