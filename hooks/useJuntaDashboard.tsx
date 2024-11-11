import { useQuery, QueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';
import {
  Junta,
  Member,
  User,
  UseJuntaDashboardResult,
  MemberResponse,
} from '@/types';

// interface User {
//   id: string;
//   username: string;
//   email: string | null;
//   role: string;
//   phone: string | null;
//   additional_info: any | null;
//   address: string | null;
//   beneficiary_address: string | null;
//   beneficiary_document_number: string | null;
//   beneficiary_document_type: string | null;
//   beneficiary_full_name: string | null;
//   beneficiary_phone: string | null;
//   birth_date: string | null;
//   document_number: string | null;
//   document_type: string | null;
//   full_name: string | null;
//   gender: string | null;
//   join_date: string | null;
//   member_role: string | null;
//   productive_activity: string | null;
//   status: string | null;
// }

// interface Member extends User {
//   juntaId: string;
//   createdAt: string;
//   updatedAt: string;
// }

// interface Junta {
//   id: string;
//   name: string;
//   description: string | null;
//   fecha_inicio: string;
//   available_capital: number;
//   base_capital: number;
//   createdAt: string;
//   createdBy: User;
//   createdById: string;
//   current_capital: number;
//   members: Member[];
// }

// interface UseJuntaDashboardResult {
//   junta: Junta | undefined;
//   members: Member[];
//   isLoading: boolean;
//   isError: boolean;
//   error: Error | null;
//   refetch: () => Promise<void>;
//   availableCapital: number;
// }

export const useJuntaDashboard = (juntaId: string): UseJuntaDashboardResult => {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const queryClient = new QueryClient();

  // Main junta query
  const {
    data: juntaData,
    isLoading,
    isError,
    error,
    refetch: refetchJuntaData,
  } = useQuery({
    queryKey: ['junta', juntaId],
    queryFn: async () => {
      if (!isAdmin || !isAuthenticated) {
        throw new Error('Unauthorized');
      }
      const data = await api.get(`juntas/${juntaId}`);
      return data;
    },
    select: (data: any) => {
      // Transform members data to flatten the structure
      const transformedMembers = data.members?.map((member: any) => {
        const user = member.user || {};
        return {
          ...user,
          juntaId: member.juntaId,
          createdAt: member.createdAt,
          updatedAt: member.updatedAt,
        };
      });

      return {
        ...data,
        members: transformedMembers,
      };
    },
    enabled: isAuthenticated && isAdmin,
    staleTime: 0,
  });

  // Capital is derived from junta data
  const availableCapital = juntaData?.available_capital ?? 0;

  // Combined refetch function
  const refetch = async () => {
    await Promise.all([
      refetchJuntaData(),
      // refetchMembers(),
      // Invalidate related queries
      // queryClient.invalidateQueries({ queryKey: ['junta', juntaId] }),
    ]);
  };

  // Separate members query using transformed data
  const { data: members = [] } = useQuery({
    queryKey: ['junta', juntaId, 'members'],
    queryFn: () => Promise.resolve(juntaData?.members || []),
    enabled: !!juntaData,
  });

  // Separate capital query
  // const { data: availableCapital = 0, refetch: refetchJuntaAvailableCapital } =
  //   useQuery({
  //     queryKey: ['junta', juntaId, 'capital'],
  //     queryFn: () => Promise.resolve(juntaData?.available_capital || 0),
  //     enabled: !!juntaData,
  //     staleTime: 0,
  //   });

  // const refetch = async () => {
  //   console.log('refetching junta data');
  //   await refetchJuntaData();
  // };

  return {
    junta: juntaData,
    members,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    availableCapital,
  };
};
