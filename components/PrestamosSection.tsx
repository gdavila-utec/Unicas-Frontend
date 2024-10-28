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

interface LoanPayment {
  id: number;
  request_date: string; // Updated field
  amount: string; // Updated field
  monthly_interest: string; // Updated field
  number_of_installments: number; // Updated field
  approved: boolean; // Updated field
  rejected: boolean; // Updated field
  rejection_reason: string; // Updated field
  paid: boolean; // Updated field
  remaining_amount: string; // Updated field
  remaining_installments: number; // Updated field
  member: number; // Updated field
  junta: number; // Updated field
  loan_type: string; // New field
  // monthly_payment: number | null; // New field
}

interface NuevoPrestamoForm {
  miembro: string;
  fechaSolicitud: string;
  montoSolicitado: number;
  interesMensual: number;
  cantidadCuotas: number;
  tipoPrestamo: string; // New field
}

const PrestamosSection = ({ juntaId }: { juntaId: string }) => {
  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nuevoPrestamoForm, setNuevoPrestamoForm] = useState<NuevoPrestamoForm>(
    {
      miembro: '',
      fechaSolicitud: '',
      montoSolicitado: 0,
      interesMensual: 0,
      cantidadCuotas: 0,
      tipoPrestamo: 'Cuota a rebatir', // Default value
    }
  );

  useEffect(() => {
    setIsLoading(true);
    fetchPrestamos();
    handleGetMembers();
    setIsLoading(false);
  }, []);

  const handleGetMembers = async () => {
    try {
      const response = await fetch(`/members/${juntaId}/`);
      if (!response.ok) throw new Error('Failed to fetch members');
      const data = await response.json();
      if (Array.isArray(data)) {
        setMembers(data);
      } else {
        console.error('Received data is not an array:', data);
        setMembers([]);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers([]);
    }
  };

  const fetchPrestamos = async (): Promise<void> => {
    try {
      const response = await fetch(`/prestamos/${juntaId}`);
      if (!response.ok) throw new Error('Failed to fetch prestamos');
      const data = await response.json();
      setPrestamos(data);
    } catch (error) {
      console.error('Error fetching prestamos:', error);
    }
  };

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
      const prestamoData = {
        request_date: nuevoPrestamoForm.fechaSolicitud,
        amount: nuevoPrestamoForm.montoSolicitado.toString(),
        monthly_interest: nuevoPrestamoForm.interesMensual.toString(),
        number_of_installments: nuevoPrestamoForm.cantidadCuotas,
        remaining_amount: nuevoPrestamoForm.montoSolicitado,
        remaining_installments: nuevoPrestamoForm.cantidadCuotas,
        member: parseInt(nuevoPrestamoForm.miembro),
        junta: juntaId,
        loan_type: nuevoPrestamoForm.tipoPrestamo, // New field
      };

      const response = await fetch('/api/prestamos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prestamoData),
      });
      if (!response.ok) throw new Error('Failed to add prestamo');
      await fetchPrestamos(); // Refresh the list
    } catch (error) {
      console.error('Error adding prestamo:', error);
    }
  };

  const handleUpdate = async (id: number): Promise<void> => {
    // Implement update logic here
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/prestamos`, {
        method: 'DELETE',
        body: JSON.stringify({ id: id }),
      });
      if (!response.ok) throw new Error('Failed to delete prestamo');
      await fetchPrestamos(); // Refresh the list
    } catch (error) {
      console.error('Error deleting prestamo:', error);
    }
  };

  if (isLoading) {
    return <h1>Loading...</h1>;
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
                          value={member.id.toString()}
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
                  name='tipoPrestamo'
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
              {prestamos.length > 0 &&
                prestamos.map((prestamo) => (
                  <TableRow key={prestamo.id}>
                    <TableCell>{prestamo.member_name}</TableCell>
                    <TableCell>S/.{prestamo.amount}</TableCell>
                    <TableCell>S/.{prestamo.remaining_amount}</TableCell>
                    <TableCell>{prestamo.remaining_installments}</TableCell>
                    <TableCell>{prestamo.status}</TableCell>
                    <TableCell>
                      <div className='flex space-x-2'>
                        {/* <Button variant="ghost" size="icon" onClick={() => handleUpdate(prestamo.id)}><Pencil className="h-4 w-4" /></Button> */}
                        <Button
                          variant='ghost'
                          size='icon'
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
        </CardContent>
      </Card>
    </div>
  );
};

export default PrestamosSection;
