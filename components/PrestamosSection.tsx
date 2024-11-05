import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
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
import { Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';
import { useBoardConfig } from '@/store/configValues';
import { Member, Prestamo, PaymentType, GuaranteeType, Junta } from '@/types';
import { useJuntaValues } from '@/store/juntaValues';
import { set } from 'date-fns';

interface LoanFormData {
  memberId: string;
  requestDate: string;
  amount: number;
  monthlyInterest: number;
  installments: number;
  paymentType: string;
  reason: string;
  guaranteeType: GuaranteeType;
  guaranteeDetail: string;
  formPurchased: boolean;
}

const PrestamosSection = ({ juntaId }: { juntaId: string }) => {
  const { monthlyInterestRate, loanFormValue } = useBoardConfig();
  const { toast } = useToast();
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const { setJunta } = useJuntaValues();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoanFormData>({
    memberId: '',
    requestDate: new Date().toISOString().split('T')[0],
    amount: 0,
    monthlyInterest: monthlyInterestRate,
    installments: 0,
    paymentType: '',
    reason: '',
    guaranteeType: 'AVAL',
    guaranteeDetail: '',
    formPurchased: false,
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [membersData, prestamosData, juntaData] = await Promise.all([
        api.get<Member[]>(`members/junta/${juntaId}`),
        api.get<Prestamo[]>(`prestamos/junta/${juntaId}`),
        api.get<Junta>(`juntas/${juntaId}`),
      ]);
      setMembers(membersData);
      setPrestamos(prestamosData);
      setJunta(juntaData);
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleGuaranteeTypeChange = (
    value: 'AVAL' | 'INMUEBLE' | 'HIPOTECARIA' | 'PRENDARIA'
  ) => {
    setFormData((prev) => ({
      ...prev,
      guaranteeType: value,
      guaranteeDetail: '', // Reset detail when type changes
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const payload = {
        juntaId,
        memberId: formData.memberId,
        request_date: formData.requestDate,
        amount: formData.amount.toString(),
        monthly_interest: formData.monthlyInterest.toString(),
        number_of_installments: formData.installments,
        loan_type: formData.paymentType,
        reason: formData.reason,
        guarantee_type: formData.guaranteeType,
        guarantee_detail: formData.guaranteeDetail,
        form_purchased: formData.formPurchased,
        payment_type: 'MENSUAL' as PaymentType,
      };

      await api.post('prestamos', payload);
      await fetchData();

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

  if (isLoading) {
    return (
      <div className='flex justify-center items-center p-8'>Cargando...</div>
    );
  }

  const handleDeleteLoan = async (id: string) => {
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

  return (
    <div className='space-y-8'>
      <Card>
        <CardHeader>
          <CardTitle>Registro de Préstamos</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className='space-y-6'
          >
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Member Selection and Request Date */}
              <div className='space-y-2'>
                <Label>Seleccionar Miembro</Label>
                <Select
                  value={formData.memberId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, memberId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Seleccionar miembro' />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem
                        key={member.id}
                        value={member.id}
                      >
                        {member.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='requestDate'>Fecha de Solicitud</Label>
                <Input
                  type='date'
                  id='requestDate'
                  name='requestDate'
                  value={formData.requestDate}
                  onChange={handleInputChange}
                />
              </div>

              {/* Amount and Interest */}
              <div className='space-y-2'>
                <Label htmlFor='amount'>Monto Solicitado</Label>
                <Input
                  type='number'
                  id='amount'
                  name='amount'
                  value={formData.amount}
                  onChange={handleInputChange}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='monthlyInterest'>Interés Mensual (%)</Label>
                <Input
                  type='number'
                  id='monthlyInterest'
                  name='monthlyInterest'
                  value={formData.monthlyInterest}
                  disabled
                />
              </div>

              {/* Installments and Payment Type */}
              <div className='space-y-2'>
                <Label htmlFor='installments'>Cantidad de Cuotas (meses)</Label>
                <Input
                  type='number'
                  id='installments'
                  name='installments'
                  value={formData.installments}
                  onChange={handleInputChange}
                />
              </div>

              <div className='space-y-2'>
                <Label>Forma de Pago</Label>
                <Select
                  value={formData.paymentType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, paymentType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Seleccionar forma de pago' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='CUOTA_REBATIR'>
                      Cuota a rebatir
                    </SelectItem>
                    <SelectItem value='CUOTA_FIJA'>Cuota fija</SelectItem>
                    <SelectItem value='CUOTA_VENCIMIENTO'>
                      Cuota al vencimiento
                    </SelectItem>
                    <SelectItem value='CUOTA_VARIABLE'>
                      Cuota variable
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reason */}
              <div className='col-span-2'>
                <Label htmlFor='reason'>Motivo</Label>
                <Textarea
                  id='reason'
                  name='reason'
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              {/* Guarantee Type and Detail */}
              <div className='space-y-2'>
                <Label>Tipo de Garantía</Label>
                <Select
                  value={formData.guaranteeType}
                  onValueChange={handleGuaranteeTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Seleccionar tipo de garantía' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='AVAL'>Aval</SelectItem>
                    <SelectItem value='INMUEBLE'>Inmueble</SelectItem>
                    <SelectItem value='HIPOTECARIA'>Hipotecaria</SelectItem>
                    <SelectItem value='PRENDARIA'>Prendaria</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label>Garantía</Label>
                {formData.guaranteeType === 'AVAL' ? (
                  <Select
                    value={formData.guaranteeDetail}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        guaranteeDetail: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Seleccionar aval' />
                    </SelectTrigger>
                    <SelectContent>
                      {members
                        .filter((member) => member.id !== formData.memberId)
                        .map((member) => (
                          <SelectItem
                            key={member.id}
                            value={member.id}
                          >
                            {member.full_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    name='guaranteeDetail'
                    value={formData.guaranteeDetail}
                    onChange={handleInputChange}
                    placeholder='Detalles de la garantía'
                  />
                )}
              </div>
            </div>

            {/* Form Purchase Checkbox */}
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='formPurchased'
                checked={formData.formPurchased}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    formPurchased: checked as boolean,
                  }))
                }
              />
              <Label htmlFor='formPurchased'>
                Compró formulario S/ {loanFormValue}
              </Label>
            </div>

            <Button type='submit'>Registrar Préstamo</Button>
          </form>
        </CardContent>
      </Card>

      {/* Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Préstamos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N°</TableHead>
                <TableHead>Cod préstamo</TableHead>
                <TableHead>Nombre completo (Socio)</TableHead>
                <TableHead>Fecha de inicio</TableHead>
                <TableHead>Monto solicitado</TableHead>
                <TableHead>Tasa de Interes</TableHead>
                <TableHead>Cuotas</TableHead>
                <TableHead>Forma de pago</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* {loan.loan_number} - {loan.loan_code} - {loan.loan_type} -{' '}
              {loan.amount} soles - {loan.number_of_installments} */}
              {prestamos.map((prestamo, index) => (
                <TableRow key={prestamo.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {prestamo.loan_code}-{prestamo.loan_number}
                  </TableCell>
                  <TableCell>{prestamo.member.full_name}</TableCell>
                  <TableCell>
                    {new Date(prestamo.request_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>S/ {prestamo.amount}</TableCell>
                  <TableCell>{prestamo.monthly_interest}%</TableCell>
                  <TableCell>{prestamo.number_of_installments}</TableCell>
                  <TableCell>{prestamo.loan_type}</TableCell>
                  <TableCell>
                    <Button
                      variant='destructive'
                      onClick={() => handleDeleteLoan(prestamo.id)}
                    >
                      Eliminar
                    </Button>
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
