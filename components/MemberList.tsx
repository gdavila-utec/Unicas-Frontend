import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EditIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MemberResponse } from '@/types';

const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

const formatDateForAPI = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toISOString();
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

export default function MembersList({
  members,
  onEdit,
  onDelete,
}: {
  members: MemberResponse[];
  onEdit: (member: MemberResponse) => void;
  onDelete: (memberId: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Miembros</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N°</TableHead>
              <TableHead>Nombre completo</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Fecha de Ingreso</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Celular</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Opciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member, index) => (
              <TableRow key={member?.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{member?.full_name}</TableCell>
                <TableCell>
                  {member?.document_type}: {member?.document_number}
                </TableCell>
                <TableCell>{formatDateForInput(member?.join_date)}</TableCell>
                <TableCell>{member?.role}</TableCell>
                <TableCell>{member?.phone}</TableCell>
                <TableCell>{member?.status}</TableCell>
                <TableCell className='space-x-2'>
                  <Button
                    onClick={() => onEdit(member)}
                    variant='outline'
                    size='sm'
                  >
                    <EditIcon className='h-4 w-4' />
                  </Button>
                  <Button
                    onClick={() => onDelete(member.id)}
                    variant='outline'
                    size='sm'
                  >
                    <Trash2Icon className='h-4 w-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {members.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className='text-center py-4 text-muted-foreground'
                >
                  No hay miembros registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
