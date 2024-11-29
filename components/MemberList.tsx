import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EditIcon, Trash2Icon,  EyeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { MemberResponse } from '@/types';
import { useRouter, useParams } from 'next/navigation';
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

// export interface MemberResponse {
//   id: string;
//   full_name: string;
//   document_type: string;
//   document_number: string;
//   member_role: string;
//   productive_activity?: string; // Consistent optional modifier
//   birth_date?: string;
//   phone?: string;
//   address?: string;
//   join_date?: string;
//   gender?: string;
//   additional_info?: string;
//   beneficiary_full_name?: string;
//   beneficiary_document_type?: string;
//   beneficiary_document_number?: string;
//   beneficiary_phone?: string;
//   beneficiary_address?: string;
//   username?: string;
//   email?: string;
//   role?: string;
//   status?: string;
// }


interface MembersListProps {
  members: MemberResponse[];
  onEdit: (member: MemberResponse) => void;
  onDelete: (memberId: string) => void;
}



// const formatDateForAPI = (dateString: string): string => {
//   if (!dateString) return '';
//   try {
//     const date = new Date(dateString);
//     return date.toISOString();
//   } catch (error) {
//     console.error('Date formatting error:', error);
//     return '';
//   }
// };

export const MembersList: React.FC<MembersListProps> = ({ members, onEdit, onDelete }) => {

  const router = useRouter();
  const params = useParams();

  const { id  } = params
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
                    onClick={() =>
                      router.push(`/juntas/${id}/socios/${member.id}`)
                    }
                    variant='outline'
                    size='sm'
                  >
                    <EyeIcon className='h-4 w-4' />
                  </Button>
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
