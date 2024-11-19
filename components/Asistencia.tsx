// components/AsistenciaSection.tsx
import {
  format,
  startOfWeek,
endOfWeek,
  eachDayOfInterval,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckIcon } from 'lucide-react';
import { useAsistencia } from '@/hooks/useAsistencia';

interface AttendanceResponse {
  members: Array<{
    id: string;
    name: string | null;
    role: string | null;
  }>;
  attendance: Array<{
    userId: string;
    agendaItemId: string;
    asistio: boolean;
  }>;
}

interface AsistenciaSectionProps {
  juntaId: string;
}

export function AsistenciaSection({ juntaId }: { juntaId: string }) {
  const startDate = format(startOfWeek(new Date()), 'yyyy-MM-dd');
  const endDate = format(endOfWeek(new Date()), 'yyyy-MM-dd');

  const { dates, members, isLoading, markAttendance } = useAsistencia(
    juntaId,
    startDate,
    endDate
  );


  if (isLoading) {
    return (
      <div className='flex justify-center items-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900' />
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-bold'>Lista de asistencia</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='min-w-[200px]'>Nombre del socio</TableHead>
            {/* {dates.map((agendaItem) => (
              <TableHead
                key={agendaItem.id}
                className='min-w-[120px] text-center'
              >
                <div className='flex flex-col gap-1'>
                  <span>{format(new Date(agendaItem.date), 'dd/MM/yyyy')}</span>
                  <span className='text-xs font-medium text-muted-foreground'>
                    {agendaItem.title}
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    {agendaItem.description}
                  </span>
                </div>
              </TableHead>
            ))} */}
            <TableHead>18/11/2024</TableHead>
            <TableHead>19/11/2024</TableHead>
            <TableHead>20/11/2024</TableHead>
            <TableHead>21/11/2024</TableHead>
            <TableHead>22/11/2024</TableHead>
            <TableHead>23/11/2024</TableHead>
            <TableHead>24/11/2024</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div>
                  <span className='font-medium'>{member.name}</span>
                  <div className='text-sm text-muted-foreground'>
                    {member.role}
                  </div>
                </div>
              </TableCell>

              {dates.map((agendaItem) => {
                const attendanceRecord = member.attendance.find(
                  (a) => a.agendaItemId === agendaItem.id
                );

                return (
                  <TableCell
                    key={`${member.id}-${agendaItem.id}`}
                    className='text-center'
                  >
                    {attendanceRecord?.attended ? (
                      <div className='flex justify-center'>
                        <CheckIcon className='h-5 w-5 text-green-500' />
                      </div>
                    ) : (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          markAttendance({
                            memberId: member.id,
                            agendaItemId: agendaItem.id,
                            asistio: true,
                          })
                        }
                      >
                        Marcar
                      </Button>
                    )}
                  </TableCell>
                );
              })}
              <TableCell>
                <div>
                  <div className='text-sm text-muted-foreground'>
                    <CheckIcon className='h-5 w-5 text-green-500' />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <CheckIcon className='h-5 w-5 text-green-500' />
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <CheckIcon className='h-5 w-5 text-green-500' />
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <CheckIcon className='h-5 w-5 text-green-500' />
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <CheckIcon className='h-5 w-5 text-green-500' />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Optional: Add attendance statistics */}
      <div className='mt-6 grid grid-cols-2 gap-4'>
        {dates.filter((a,i)=>i===0).map((agendaItem) => {
          const attendanceCount = members.reduce((count, member) => {
            const attended = member.attendance.find(
              (a) => a.agendaItemId === agendaItem.id
            )?.attended;
            return attended ? count + 1 : count;
          }, 0);

          return (
            <Card key={agendaItem.id}>
              <CardHeader>
                <CardTitle className='text-sm'>{agendaItem.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {((attendanceCount / members.length) * 100).toFixed(0)}%
                </div>
                <p className='text-xs text-muted-foreground'>
                  {attendanceCount} de {members.length} asistentes
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}