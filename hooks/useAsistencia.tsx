// hooks/useAsistencia.ts
// hooks/useAsistencia.ts
import { useQuery, useMutation, QueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { MemberResponse } from '../types'

interface CreateAgendaParams {
  title: string;
  description: string;
  date: string;
  juntaId: string;
}

interface DaySchedule {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  attendance: Array<{
    userId: string;
    attended: boolean;
  }>;
}

interface AttendanceResponse {
  agendaItems: Array<{
    id: string;
    title: string;
    description: string;
    weekStartDate: string;
    weekEndDate: string;
    daySchedules: DaySchedule[];
  }>;
  members: Array<{
    id: string;
    name: string;
    role: string;
  }>;
}

export const useAttendance = (juntaId: string) => {
  // const startDate = format(startOfWeek(new Date()), 'yyyy-MM-dd');
  // const endDate = format(endOfWeek(new Date()), 'yyyy-MM-dd');
    const startDate = '2024-11-25'
    const endDate = '2024-12-01'
  const queryClient = new QueryClient()

  const { data, isLoading } = useQuery<AttendanceResponse>({
    queryKey: ['asistencias', { juntaId, startDate, endDate }],
    queryFn: async () => {
      const response = await api.get(
        `attendance/list?juntaId=${juntaId}&startDate=${startDate}&endDate=${endDate}`
      );
      console.log('asistencias response: ', response);
      return response;
    },
    staleTime: 0,
  });

  const createAgendaMutation = useMutation({
    mutationFn: (params: CreateAgendaParams) => {
      return api.post('agenda', params);
    },
    onSuccess: () => {
      // queryClient.invalidateQueries(['agenda']);
    },
  });

  const createWeeklyAgenda = () => {
    createAgendaMutation.mutate({
      title: 'Weekly Meeting',
      description: 'Regular team sync',
      date: startDate,
      juntaId,
    });
  };

  const markAttendanceMutation =  useMutation({
    mutationFn: (variables: {
      userId: string;
      agendaItemId: string;
      dayScheduleId: string;
      attended: boolean;
    }) => {
      const response =  api.post('attendance/mark', variables);
      console.log('markAttendanceMutation response: ', response);
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asistencias'] });
    },
  });

  return {
    agendaItem: data?.agendaItems[0],
    members: data?.members.filter((m) => m.role === 'socio') || [],
    isLoading: isLoading || markAttendanceMutation.isPending,
    markAttendance: (variables: {
      userId: string;
      agendaItemId: string;
      dayScheduleId: string;
      attended: boolean;
    }) => markAttendanceMutation.mutate(variables),
    startDate,
    endDate,
    createWeeklyAgenda,
    isCreatingAgenda: createAgendaMutation.isPending,
  };
};