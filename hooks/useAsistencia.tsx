// hooks/useAsistencia.ts
// hooks/useAsistencia.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { MemberResponse }  from '../types'

// types for frontend
interface AgendaItem {
  id: string;
  title: string;
  date: string;
  description: string;
}

interface AttendanceRecord {
  date: string;
  agendaItemId: string;
  attended: boolean;
}

interface MemberWithAttendance {
  id: string;
  name: string;
  role: string;
  attendance: AttendanceRecord[];
}

interface AttendanceResponse {
  dates: AgendaItem[]; // Updated to include full agenda item info
  members: MemberWithAttendance[];
}

// Updated hook
export const useAsistencia = (juntaId: string, startDate: string, endDate: string) => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
  } = useQuery<AttendanceResponse>({
    queryKey: ['asistencias', { juntaId, startDate, endDate }],
    queryFn: async () => {
      const response = await api.get(
        `attendance/list?juntaId=${juntaId}&startDate=${startDate}&endDate=${endDate}`
      );
      return response;
    },
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async ({
      memberId,
      agendaItemId,
      asistio
    }: {
      memberId: string;
      agendaItemId: string;
      asistio: boolean;
    }) => {
      return api.post('attendance/mark', {
        memberId,
        agendaItemId,
        asistio
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['asistencias', { juntaId, startDate, endDate }]
      });
    }
  });

  return {
    dates: data?.dates || [],
    members: data?.members || [],
    isLoading,
    markAttendance: markAttendanceMutation.mutateAsync
  };
};

