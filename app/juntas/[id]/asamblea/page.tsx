'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  CalendarIcon,
  Check,
  Clock,
  Edit,
  MoreHorizontalIcon,
  Trash,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const Page = ({ params }: { params: { id: string } }) => {
  type Asistencia = {
    memberId: string;
    asistencia: string;
  };

  const [asistencia, setAsistencia] = useState<Asistencia[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [agenda, setAgenda] = useState<any[]>([]);
  const [newAgendaItem, setNewAgendaItem] = useState('');
  const [dateAccion, setDateAccion] = useState<Date>();

  const handleAddAgendaItem = async (e: React.FormEvent) => {
    e.preventDefault();
    // Push new item to agenda
  };

  const fetchMembers = async () => {
    const response = await fetch(`/api/members/${params.id}`);
    const data = await response.json();
    setMembers(data);
  };

  const fetchAgenda = async () => {
    const response = await fetch(`/api/juntas/${params.id}/agenda`);
    const data = await response.json();
    setAgenda(data);
  };

  // Asistencia
  const handleAsistencia = (memberId: string, asistenciaStatus: string) => {
    setAsistencia((prevAsistencia) => {
      const existingIndex = prevAsistencia.findIndex(
        (a) => a.memberId === memberId
      );
      if (existingIndex !== -1) {
        // Update existing asistencia
        const updatedAsistencia = [...prevAsistencia];
        updatedAsistencia[existingIndex] = {
          memberId,
          asistencia: asistenciaStatus,
        };
        return updatedAsistencia;
      } else {
        // Add new asistencia
        return [...prevAsistencia, { memberId, asistencia: asistenciaStatus }];
      }
    });
  };
  const handleEditAgendaItem = async (id: string) => {
    // Edit item in agenda
  };

  const handleDeleteAgendaItem = async (id: string) => {
    // Delete item from agenda
  };

  const getAsistenciaIcon = (status: string) => {
    switch (status) {
      case 'Asistió':
        return <Check className='mr-2 h-4 w-4 text-green-500' />;
      case 'Tardanza':
        return <Clock className='mr-2 h-4 w-4 text-yellow-500' />;
      case 'Faltó':
        return <X className='mr-2 h-4 w-4 text-red-500' />;
      default:
        return null;
    }
  };

  const submitAsistencia = async (data: any) => {
    // Submit asistencia
    const response = await fetch(`/api/assemblies/${params.id}/asistencia`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const dataResponse = await response.json();
  };

  // Pagos
  const [showDifferentPayment, setShowDifferentPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<any | null>(null);
  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const fetchPrestamos = async () => {
    const response = await fetch(`/api/prestamos/${params.id}`);
    const data = await response.json();
    setPrestamos(data);
  };

  const fetchHistory = async () => {
    const response = await fetch(`/api/juntas/${params.id}/history`);
    const data = await response.json();
    setHistory(data);
  };
  const onSubmitPagos = async (data: z.infer<typeof formSchemaPagos>) => {
    // Submit pago
  };

  const formSchemaPagos = z.object({
    date: z.date(),
    member: z.string(),
    loan: z.string(),
    monthly_payment: z.number(),
    custom_amount: z.number(),
  });

  const formPagos = useForm<z.infer<typeof formSchemaPagos>>({
    resolver: zodResolver(formSchemaPagos),
    defaultValues: {
      date: new Date(),
      member: '',
      loan: '',
      monthly_payment: 0,
      custom_amount: 0,
    },
  });

  // Prestamos

  const formSchemaPrestamos = z.object({
    date: z.date(),
  });
  const onSubmitPrestamos = async (
    data: z.infer<typeof formSchemaPrestamos>
  ) => {
    // Submit prestamo
  };
  const handleSubmitPrestamos = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit prestamo
  };
  const [nuevoPrestamoForm, setNuevoPrestamoForm] = useState({
    miembro: '',
    fechaSolicitud: '',
    montoSolicitado: 0,
    interesMensual: 0,
    cantidadCuotas: 0,
    tipoPrestamo: '',
  });
  const handleInputChangePrestamos = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setNuevoPrestamoForm({ ...nuevoPrestamoForm, [name]: value });
  };

  useEffect(() => {
    fetchMembers();
    fetchAgenda();
    fetchPrestamos();
  }, []);

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Asamblea</h1>

      <div className='mb-4'>
        <h2 className='text-lg font-medium mb-4'>Asistencia</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Asistencia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length > 0 &&
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.full_name}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='outline'
                          className='w-40'
                        >
                          {getAsistenciaIcon(
                            asistencia.find((a) => a.memberId === member.id)
                              ?.asistencia || ''
                          )}
                          {asistencia.find((a) => a.memberId === member.id)
                            ?.asistencia || 'Seleccionar'}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => handleAsistencia(member.id, 'Asistió')}
                        >
                          <Check className='mr-2 h-4 w-4' /> Asistió
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleAsistencia(member.id, 'Tardanza')
                          }
                        >
                          <Clock className='mr-2 h-4 w-4' /> Tardanza
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAsistencia(member.id, 'Faltó')}
                        >
                          <X className='mr-2 h-4 w-4' /> Faltó
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <div className='mb-4'>
        <h2 className='text-lg font-medium mb-4'>Agenda</h2>
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Punto</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agenda.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.content}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='outline'
                          className='w-8 h-8 p-0'
                        >
                          <MoreHorizontalIcon className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => handleEditAgendaItem(item.id)}
                        >
                          <Edit className='mr-2 h-4 w-4' />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteAgendaItem(item.id)}
                        >
                          <Trash className='mr-2 h-4 w-4' />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <form
            onSubmit={handleAddAgendaItem}
            className='mt-4 flex'
          >
            <Input
              placeholder='Nuevo punto de agenda'
              value={newAgendaItem}
              onChange={(e) => setNewAgendaItem(e.target.value)}
              className='mr-2'
            />
            <Button type='submit'>Agregar</Button>
          </form>
        </div>
      </div>
      <div className='mb-4'>
        <h2 className='text-lg font-medium mb-4'>Compra de acciones</h2>
        <Card>
          <CardHeader>
            <CardTitle className='text-xl font-semibold'>
              Compra de Acciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h1>Miembro</h1>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder='Seleccione un miembro' />
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
            <h1>Fecha de compra</h1>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant='outline'>
                  <span>
                    {dateAccion
                      ? dateAccion.toLocaleDateString()
                      : 'Pick a date'}
                  </span>
                  <CalendarIcon className='ml-2 h-4 w-4' />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className='w-auto p-0'
                align='start'
              >
                <Calendar
                  mode='single'
                  selected={dateAccion}
                  onSelect={(date) => {
                    setDateAccion(date);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <h1>Cantidad</h1>
            <Input type='number' />
            <h1>Valor</h1>
            <Input type='number' />
            <Button type='submit'>Registrar</Button>
          </CardContent>
        </Card>
      </div>
      <div className='mb-4'>
        <h1 className='text-lg font-medium mb-4'>Pago de prestamo</h1>
        <div className='space-y-8'>
          <Card>
            <CardHeader>
              <CardTitle>Pago a Cuenta de Préstamos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading...</div>
              ) : (
                <Form {...formPagos}>
                  <form
                    onSubmit={formPagos.handleSubmit(onSubmitPagos)}
                    className='space-y-4'
                  >
                    <FormField
                      control={formPagos.control}
                      name='date'
                      render={({ field }) => (
                        <FormItem className='flex flex-col'>
                          <FormLabel>Fecha de Pago</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={'outline'}
                                  className={`w-full pl-3 text-left font-normal ${
                                    !field.value && 'text-muted-foreground'
                                  }`}
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP')
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
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date('1900-01-01')
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formPagos.control}
                      name='member'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Miembro</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedMember(value); // Update selected member state
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='Seleccionar miembro' />
                              </SelectTrigger>
                            </FormControl>
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
                                <div>No members available</div>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={formPagos.control}
                      name='loan'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Préstamo</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              const loan = prestamos.find(
                                (p) => p.id.toString() === value
                              );
                              setSelectedLoan(loan || null);
                              // Update the monthly_payment field when a loan is selected
                              if (loan) {
                                formPagos.setValue(
                                  'monthly_payment',
                                  loan.monthly_payment || 0
                                );
                              }
                            }}
                            defaultValue={field.value}
                            disabled={!selectedMember}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='Seleccionar préstamo' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {prestamos.length > 0 ? (
                                prestamos.filter(
                                  (prestamo) =>
                                    prestamo.member === Number(selectedMember)
                                ).length > 0 ? (
                                  prestamos
                                    .filter(
                                      (prestamo) =>
                                        prestamo.member ===
                                        Number(selectedMember)
                                    )
                                    .map((prestamo) => (
                                      <SelectItem
                                        key={prestamo.id}
                                        value={prestamo.id.toString()}
                                      >
                                        {prestamo.amount} soles -{' '}
                                        {prestamo.member_name} -{' '}
                                        {prestamo.request_date} -{' '}
                                        {prestamo.loan_type}
                                      </SelectItem>
                                    ))
                                ) : (
                                  <SelectItem
                                    value='No hay prestamos'
                                    disabled
                                  >
                                    No hay prestamos
                                  </SelectItem> // Display message if no loans
                                )
                              ) : (
                                <SelectItem
                                  value='No hay prestamos'
                                  disabled
                                >
                                  No hay prestamos
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedLoan && (
                      <div>
                        {selectedLoan.monthly_payment == null && (
                          <FormField
                            control={formPagos.control}
                            name='monthly_payment'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Monto de pago diferente</FormLabel>
                                <Input
                                  type='number'
                                  {...field}
                                  placeholder='Ingrese el monto de pago'
                                  value={field.value || ''}
                                  onChange={(e) => {
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    );
                                  }}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        {selectedLoan.monthly_payment != null && (
                          <p>
                            <span className='text-sm font-semibold'>
                              Cuota mensual:
                            </span>{' '}
                            S/{selectedLoan.monthly_payment.toFixed(2)}
                          </p>
                        )}
                      </div>
                    )}

                    {selectedLoan?.monthly_payment != null && (
                      <>
                        <div className='flex items-center space-x-2'>
                          <Checkbox
                            id='registrarCuotaDiferente'
                            checked={showDifferentPayment}
                            onCheckedChange={(checked) =>
                              setShowDifferentPayment(checked as boolean)
                            }
                          />
                          <Label htmlFor='registrarCuotaDiferente'>
                            Registrar cuota diferente
                          </Label>
                        </div>
                        {showDifferentPayment && (
                          <FormField
                            control={formPagos.control}
                            name='custom_amount'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Monto de pago diferente</FormLabel>
                                <Input
                                  type='number'
                                  {...field}
                                  placeholder='Ingrese el monto de pago'
                                  value={field.value || ''}
                                  onChange={(e) => {
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    );
                                  }}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </>
                    )}
                    <Button type='submit'>Realizar Pago</Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de Pagos de Préstamos</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Préstamo ID</TableHead>
                      <TableHead>Tipo prestamo</TableHead>
                      <TableHead>Monto Cuota</TableHead>
                      <TableHead>Monto Interés</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {format(
                            new Date(item.fecha_pago),
                            'yyyy-MM-dd HH:mm:ss'
                          )}
                        </TableCell>
                        <TableCell>{item.prestamo_id}</TableCell>
                        <TableCell>{item.prestamo_loan_type}</TableCell>
                        <TableCell>
                          S/
                          {item.custom_amount
                            ? item.custom_amount
                            : item.prestamo_monthly_payment}
                        </TableCell>
                        <TableCell>
                          S/{item.prestamo_monthly_interest}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div>No payment history available.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <div className='mb-4'>
        <h1 className='text-lg font-medium mb-4'>Registrar prestamo</h1>
        <Card>
          <CardHeader>
            <h2 className='text-2xl font-bold'>Agregar Préstamo</h2>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmitPrestamos}
              className='space-y-4'
            >
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label>Miembro</Label>
                  <Select value={nuevoPrestamoForm.miembro}>
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
                    onChange={handleInputChangePrestamos}
                  />
                </div>
                <div>
                  <Label htmlFor='montoSolicitado'>Monto Solicitado</Label>
                  <Input
                    type='number'
                    id='montoSolicitado'
                    name='montoSolicitado'
                    value={nuevoPrestamoForm.montoSolicitado}
                    onChange={handleInputChangePrestamos}
                  />
                </div>
                <div>
                  <Label htmlFor='interesMensual'>Interés Mensual</Label>
                  <Input
                    type='number'
                    id='interesMensual'
                    name='interesMensual'
                    value={nuevoPrestamoForm.interesMensual}
                    onChange={handleInputChangePrestamos}
                  />
                </div>
                <div>
                  <Label htmlFor='cantidadCuotas'>Cantidad de Cuotas</Label>
                  <Input
                    type='number'
                    id='cantidadCuotas'
                    name='cantidadCuotas'
                    value={nuevoPrestamoForm.cantidadCuotas}
                    onChange={handleInputChangePrestamos}
                  />
                </div>
                <div>
                  <Label htmlFor='tipoPrestamo'>Tipo de Préstamo</Label>
                  <Select
                    name='tipoPrestamo'
                    value={nuevoPrestamoForm.tipoPrestamo}
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
      </div>
    </div>
  );
};

export default Page;
