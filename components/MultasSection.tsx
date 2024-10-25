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

export default function MultaSection({ juntaId }: { juntaId: string }) {
  const [member, setMember] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [multas, setMultas] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/members/${juntaId}`
        );
        if (!response.ok) throw new Error('Failed to fetch members');
        const data = await response.json();
        setMembers(data);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchMultas = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/juntas/${juntaId}/multas`
        );
        if (!response.ok) throw new Error('Failed to fetch multas');
        const data = await response.json();
        setMultas(data);
      } catch (error) {
        console.error('Error fetching multas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
    fetchMultas();
  }, [juntaId]);

  const handlePayMulta = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Reason', reason);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/juntas/${juntaId}/multas`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason,
          amount: amount,
          member: member,
          comment: description,
        }),
      }
    );

    if (response.ok) {
      const newMulta = await response.json();
      setMultas([...multas, newMulta]);
      setMember('');
      setDescription('');
      setAmount('');
    }
  };

  const handleDeleteMulta = async (multaId: number) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/juntas/${juntaId}/multas/${multaId}`,
      {
        method: 'DELETE',
      }
    );

    if (response.ok) {
      setMultas(multas.filter((multa) => multa.id !== multaId));
    } else {
      console.error('Failed to delete multa');
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
              <Button onClick={handlePayMulta}>Pagar Multa</Button>
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
                      <Button onClick={() => handleDeleteMulta(multa.id)}>
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div>No fines available.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
