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
import { useAttendance } from '@/hooks/useAsistencia';

import { useEffect, useState } from 'react'
// components/AsistenciaSection.tsx
export function AsistenciaSection({ juntaId }: { juntaId: string }) {
  const {
    agendaItem,
    members,
    isLoading,
    markAttendance,
    createWeeklyAgenda,
    isCreatingAgenda,
  } = useAttendance(juntaId);

  if (isLoading) {
    return <div className='animate-spin' />;
  }

  if (!agendaItem) {
    return (
      <div className='flex flex-col items-center justify-center p-8 space-y-4'>
        <p className='text-muted-foreground'>No hay agenda para esta semana</p>
        <Button
          onClick={createWeeklyAgenda}
          disabled={isCreatingAgenda}
        >
          {isCreatingAgenda ? (
            <div className='animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full' />
          ) : null}
          Generar Agenda
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-bold'>Lista de asistencia</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre del socio</TableHead>
            {agendaItem.daySchedules.map((schedule) => (
              <TableHead
                key={schedule.id}
                className='text-center'
              >
                {format(new Date(schedule.startTime), 'dd/MM/yyyy')}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <span>{member.name}</span>
                <div className='text-sm text-muted-foreground'>
                  {member.role}
                </div>
              </TableCell>
              {agendaItem.daySchedules.map((schedule) => {
                const isAttended = schedule.attendance.some(
                  (a) => a.userId === member.id && a.attended
                );

                return (
                  <TableCell
                    key={schedule.id}
                    className='text-center'
                  >
                    {isAttended ? (
                      <CheckIcon className='h-5 w-5 text-green-500 mx-auto' />
                    ) : (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          markAttendance({
                            userId: member.id,
                            agendaItemId: agendaItem.id,
                            dayScheduleId: schedule.id,
                            attended: true,
                          })
                        }
                      >
                        Marcar
                      </Button>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}