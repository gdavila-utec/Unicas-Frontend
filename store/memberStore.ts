import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, JuntaMember } from '../types';

type StoreState = {
  selectedMember: User | null;
  members: User[] | null;
  juntaMembers: JuntaMember[] | null;
  isLoading: boolean;
  error: string | null;
};

type StoreActions = {
  // User management
  setSelectedMember: (member: User | null) => void;
  setMembers: (members: User[] | null) => void;
  addMember: (member: User) => void;
  updateMember: (memberId: string, updates: Partial<User>) => void;
  getMemberById: (id: string) => User | null;

  // Junta member management
  setJuntaMembers: (members: JuntaMember[] | null) => void;
  addJuntaMember: (juntaMember: JuntaMember) => void;
  removeJuntaMember: (juntaId: string, userId: string) => void;
  getJuntaMembers: () => User[] | null;
  isUserInJunta: (juntaId: string, userId: string) => boolean;
  getMemberJuntas: (userId: string) => JuntaMember[] | null;

  // State management
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

type MemberStore = StoreState & StoreActions;

const initialState: StoreState = {
  selectedMember: null,
  members: null,
  juntaMembers: null,
  isLoading: false,
  error: null,
};

export const useMemberStore = create<MemberStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // User management
      setSelectedMember: (member) => set(() => ({ selectedMember: member })),

      setMembers: (members) => set(() => ({ members })),

      addMember: (member) =>
        set((state) => ({
          members: [...(state.members || []), member],
        })),

      updateMember: (memberId, updates) =>
        set((state) => ({
          members:
            state.members?.map((member) =>
              member.id === memberId ? { ...member, ...updates } : member
            ) || null,
          selectedMember:
            state.selectedMember?.id === memberId
              ? { ...state.selectedMember, ...updates }
              : state.selectedMember,
        })),

      getMemberById: (id) =>
        get().members?.find((member) => member.id === id) || null,

      // Junta member management
      setJuntaMembers: (members) => set(() => ({ juntaMembers: members })),

      addJuntaMember: (juntaMember) =>
        set((state) => ({
          juntaMembers: [...(state.juntaMembers || []), juntaMember],
        })),

      removeJuntaMember: (juntaId, userId) =>
        set((state) => ({
          juntaMembers:
            state.juntaMembers?.filter(
              (member) =>
                !(member.juntaId === juntaId && member.userId === userId)
            ) || null,
        })),

      getJuntaMembers: () => {
        const store = get();
        // console.log('store: ', store);
        return store.members;
      },

      isUserInJunta: (juntaId, userId) =>
        get().juntaMembers?.some(
          (member) => member.juntaId === juntaId && member.userId === userId
        ) || false,

      getMemberJuntas: (userId) =>
        get().juntaMembers?.filter((member) => member.userId === userId) ||
        null,

      // State management
      setLoading: (isLoading) => set(() => ({ isLoading })),

      setError: (error) => set(() => ({ error })),

      reset: () => set(initialState),
    }),
    {
      name: 'member-store',
      partialize: (state) => ({
        members: state.members,
        juntaMembers: state.juntaMembers,
      }),
    }
  )
);

// Optional: Helper types for filtering and querying
export type MemberFilters = {
  status?: string;
  role?: string;
  juntaId?: string;
  memberRole?: string;
};

export type MemberSortField = 'full_name' | 'join_date' | 'status' | 'role';

export type MemberSort = {
  field: MemberSortField;
  direction: 'asc' | 'desc';
};

// Optional: Helper functions for filtering and sorting members
export const filterMembers = (
  members: User[] | null,
  filters: MemberFilters
): User[] => {
  if (!members) return [];

  return members.filter((member) => {
    if (filters.status && member.status !== filters.status) return false;
    if (filters.role && member.role !== filters.role) return false;
    if (filters.memberRole && member.member_role !== filters.memberRole)
      return false;
    return true;
  });
};

export const sortMembers = (members: User[], sort: MemberSort): User[] => {
  // return [...members].sort((a, b) => {
  //   const aValue = a[sort.field];
  //   const bValue = b[sort.field];

  //   if (aValue === null) return 1;
  //   if (bValue === null) return -1;

  //   const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
  //   return sort.direction === 'asc' ? comparison : -comparison;
  // });
  return [];
};
