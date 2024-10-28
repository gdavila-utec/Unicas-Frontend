import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import React, { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';

interface Member {
  id: number;
  full_name: string;
}

interface Multa {
  id: number;
  member_name: string;
  reason: string;
  amount: number;
  status: string;
}

export default function MultaSection({ juntaId }: { juntaId: string }) {
  const { toast } = useToast();
  const [member, setMember] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [multas, setMultas] = useState<Multa[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [membersData, multasData] = await Promise.all([
          api.get<Member[]>(`members/${juntaId}`),
          api.get<Multa[]>(`juntas/${juntaId}/multas`),
        ]);
        setMembers(membersData);
        setMultas(multasData);
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

    fetchData();
  }, [juntaId, toast]);

  const handlePayMulta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newMulta = await api.post<Multa>(`juntas/${juntaId}/multas`, {
        reason,
        amount,
        member,
        comment: description,
      });

      setMultas([...multas, newMulta]);
      setMember('');
      setDescription('');
      setAmount('');
      setReason('');

      toast({
        title: 'Éxito',
        description: 'Multa registrada correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error al registrar multa',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMulta = async (multaId: number) => {
    try {
      await api.delete(`juntas/${juntaId}/multas/${multaId}`);
      setMultas(multas.filter((multa) => multa.id !== multaId));
      toast({
        title: 'Éxito',
        description: 'Multa eliminada correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error al eliminar multa',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='space-y-8'>
      <Card>
        <CardHeader>
          <CardTitle>Pagar Multa</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <form
              className='space-y-4'
              onSubmit={handlePayMulta}
            >
              <Select
                onValueChange={setMember}
                value={member}
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

              <Select
                onValueChange={setReason}
                value={reason}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Motivo' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='TARDANZA'>Tardanza</SelectItem>
                  <SelectItem value='INASISTENCIA'>Inasistencia</SelectItem>
                  <SelectItem value='OTROS'>Otros</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder='Comentarios'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Input
                type='number'
                placeholder='Monto'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button type='submit'>Pagar Multa</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Multas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : multas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Miembro</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {multas.map((multa) => (
                  <TableRow key={multa.id}>
                    <TableCell>{multa.member_name}</TableCell>
                    <TableCell>{multa.reason}</TableCell>
                    <TableCell>{multa.amount}</TableCell>
                    <TableCell>{multa.status}</TableCell>
                    <TableCell>
                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => handleDeleteMulta(multa.id)}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div>No hay multas registradas.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
