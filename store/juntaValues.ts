import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Junta, JuntaMember, User } from '../types';

// Combined store type
type JuntaStore = StoreState & StoreActions;

// State interface
interface StoreState {
  selectedJunta: Junta | null;
  juntas: Junta[];
  members: JuntaMember[];
  juntaMembers: Record<string, User[]>;
  reserva_legal: number;
  fondo_social: number;
  isLoading: boolean;
  error: string | null;
}

// Actions interface
interface StoreActions {
  // Junta management
  setSelectedJunta: (junta: Junta | null) => void;
  setJuntas: (juntas: Junta[]) => void;
  // getJuntaById: (id: string) => Junta | null;
  getJuntaById: (juntaId: string) => Junta | null;
  updateJunta: (juntaId: string, updates: Partial<Junta>) => void;

  // Member management
  setMembers: (juntaId: string, members: User[]) => void;
  getMembers: (juntaId: string) => User[];
  addMember: (juntaId: string, member: User) => void;
  removeMember: (juntaId: string, memberId: string) => void;
  getMembersByJunta: (juntaId: string) => User[];
  isMemberInJunta: (juntaId: string, memberId: string) => boolean;

  // Capital management
  getAvailableCapital: (juntaId: string) => number;
  setAvailableCapital: (juntaId: string, amount: number) => void;
  updateAvailableCapital: (
    juntaId: string,
    amount: number,
    operation: 'add' | 'subtract'
  ) => void;
  updateCurrentCapital: (
    juntaId: string,
    amount: number,
    operation: 'add' | 'subtract'
  ) => void;
  updateBaseCapital: (juntaId: string, amount: number) => void;
  setReservaLegal: (value: number) => void;
  setFondoSocial: (value: number) => void;
  getCapitalAmounts: (juntaId: string) => CapitalAmounts | null;

  // State management
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  resetCapital: () => void;
  reset: () => void;
}

// Capital amounts interface
interface CapitalAmounts {
  available: number;
  current: number;
  base: number;
}

const initialState: StoreState = {
  selectedJunta: null,
  juntas: [],
  members: [],
  juntaMembers: {}, // Initialize as empty object
  reserva_legal: 0,
  fondo_social: 0,
  isLoading: false,
  error: null,
};

export const useJuntaStore = create<JuntaStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Junta management
      setSelectedJunta: (junta) => set(() => ({ selectedJunta: junta })),

      setJuntas: (juntas) => set(() => ({ juntas })),

      getJuntaById: (juntaId) => {
        const store = get();
        console.log('useJuntaStore store: ', store);
        return store.selectedJunta ?? null;
      },

      updateJunta: (juntaId, updates) =>
        set((state) => ({
          juntas: state.juntas.map((junta) =>
            junta.id === juntaId ? { ...junta, ...updates } : junta
          ),
          selectedJunta:
            state.selectedJunta?.id === juntaId
              ? { ...state.selectedJunta, ...updates }
              : state.selectedJunta,
        })),

      // Member management
      setMembers: (juntaId: string, members: User[]) =>
        set((state) => ({
          juntaMembers: {
            ...state.juntaMembers,
            [juntaId]: members,
          },
        })),

      getMembers: (juntaId: string) => {
        const store = get();
        return store.selectedJunta && store.selectedJunta
          ? store.juntaMembers[juntaId]
          : [];
      },

      addMember: (juntaId: string, member: User) =>
        set((state) => {
          const existingMembers = state.juntaMembers[juntaId] ?? [];
          return {
            juntaMembers: {
              ...state.juntaMembers,
              [juntaId]: [...existingMembers, member],
            },
          };
        }),

      removeMember: (juntaId: string, memberId: string) =>
        set((state) => {
          const existingMembers = state.juntaMembers[juntaId] ?? [];
          return {
            juntaMembers: {
              ...state.juntaMembers,
              [juntaId]: existingMembers.filter(
                (member) => member.id !== memberId
              ),
            },
          };
        }),

      getMembersByJunta: (juntaId: string) => {
        const store = get();
        return store.juntaMembers[juntaId] ?? [];
      },

      isMemberInJunta: (juntaId: string, memberId: string) => {
        const store = get();
        const members = store.juntaMembers[juntaId] ?? [];
        return members.some((member) => member.id === memberId);
      },

      // Capital management
      getAvailableCapital: (juntaId: string) => {
        const store = get();
        const junta = store.juntas?.find?.((j) => j.id === juntaId);
        return junta?.available_capital ?? 0;
      },

      setAvailableCapital: (juntaId: string, amount: number) =>
        set((state) => ({
          juntas: state.juntas.map((junta) =>
            junta.id === juntaId
              ? { ...junta, available_capital: Math.max(0, amount) }
              : junta
          ),
          selectedJunta:
            state.selectedJunta?.id === juntaId
              ? {
                  ...state.selectedJunta,
                  available_capital: Math.max(0, amount),
                }
              : state.selectedJunta,
        })),

      updateAvailableCapital: (
        juntaId: string,
        amount: number,
        operation: 'add' | 'subtract'
      ) =>
        set((state) => {
          const juntas = state.juntas.map((junta) => {
            if (junta.id !== juntaId) return junta;

            const currentAmount = junta.available_capital ?? 0;
            const newAmount =
              operation === 'add'
                ? currentAmount + amount
                : currentAmount - amount;

            return {
              ...junta,
              available_capital: Math.max(0, newAmount),
            };
          });

          const selectedJunta =
            state.selectedJunta?.id === juntaId
              ? {
                  ...state.selectedJunta,
                  available_capital:
                    operation === 'add'
                      ? (state.selectedJunta.available_capital ?? 0) + amount
                      : Math.max(
                          0,
                          (state.selectedJunta.available_capital ?? 0) - amount
                        ),
                }
              : state.selectedJunta;

          return { juntas, selectedJunta };
        }),

      updateCurrentCapital: (
        juntaId: string,
        amount: number,
        operation: 'add' | 'subtract'
      ) =>
        set((state) => {
          const juntas = state.juntas.map((junta) => {
            if (junta.id !== juntaId) return junta;

            const currentAmount = junta.current_capital ?? 0;
            const newAmount =
              operation === 'add'
                ? currentAmount + amount
                : currentAmount - amount;

            return {
              ...junta,
              current_capital: Math.max(0, newAmount),
            };
          });

          const selectedJunta =
            state.selectedJunta?.id === juntaId
              ? {
                  ...state.selectedJunta,
                  current_capital:
                    operation === 'add'
                      ? (state.selectedJunta.current_capital ?? 0) + amount
                      : Math.max(
                          0,
                          (state.selectedJunta.current_capital ?? 0) - amount
                        ),
                }
              : state.selectedJunta;

          return { juntas, selectedJunta };
        }),

      updateBaseCapital: (juntaId: string, amount: number) =>
        set((state) => ({
          juntas: state.juntas.map((junta) =>
            junta.id === juntaId
              ? { ...junta, base_capital: Math.max(0, amount) }
              : junta
          ),
          selectedJunta:
            state.selectedJunta?.id === juntaId
              ? { ...state.selectedJunta, base_capital: Math.max(0, amount) }
              : state.selectedJunta,
        })),

      setReservaLegal: (value) =>
        set(() => ({ reserva_legal: Math.max(0, value) })),

      setFondoSocial: (value) =>
        set(() => ({ fondo_social: Math.max(0, value) })),

      getCapitalAmounts: (juntaId: string) => {
        const store = get();
        // Safely access juntas and find the specific junta
        const junta = store.juntas?.find?.((j) => j.id === juntaId);

        if (!junta) return null;

        return {
          available: junta.available_capital ?? 0,
          current: junta.current_capital ?? 0,
          base: junta.base_capital ?? 0,
        };
      },

      // State management
      setLoading: (isLoading) => set(() => ({ isLoading })),

      setError: (error) => set(() => ({ error })),

      resetCapital: () => set(() => ({ reserva_legal: 0, fondo_social: 0 })),

      reset: () => set(initialState),
    }),
    {
      name: 'junta-store',
      partialize: (state) => ({
        juntas: state.juntas,
        juntaMembers: state.juntaMembers,
        reserva_legal: state.reserva_legal,
        fondo_social: state.fondo_social,
      }),
    }
  )
);

// Helper types exports
export type { JuntaStore, StoreState, StoreActions, CapitalAmounts };
