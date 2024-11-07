import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PaymentSchedule, User, CapitalMovement, Multa } from '../types';

// multasStore.ts
interface MultaState {
  selectedMulta: Multa | null;
  multas: Multa[] | null;
  capitalMovements: CapitalMovement[] | null;
  isLoading: boolean;
  error: string | null;
}

type StoreState = {
  selectedMulta: Multa | null;
  multas: Multa[] | null;
  capitalMovements: CapitalMovement[] | null;
  isLoading: boolean;
  error: string | null;
};

type StoreActions = {
  setSelectedMulta: (multa: Multa | null) => void;
  setMultas: (multas: Multa[] | null) => void;
  addMulta: (multa: Multa) => void;
  updateMulta: (multaId: string, updates: Partial<Multa>) => void;
  getMultaById: (id: string) => Multa | null;
  getMemberMultas: (memberId: string) => Multa[] | null;
  setCapitalMovements: (movements: CapitalMovement[] | null) => void;
  addCapitalMovement: (movement: CapitalMovement) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

type MultaStore = StoreState & StoreActions;

const initialState: StoreState = {
  selectedMulta: null,
  multas: null,
  capitalMovements: null,
  isLoading: false,
  error: null,
};

export const useMultaStore = create<MultaStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSelectedMulta: (multa) => set(() => ({ selectedMulta: multa })),

      setMultas: (multas) => set(() => ({ multas })),

      addMulta: (multa) =>
        set((state) => ({
          multas: [...(state.multas || []), multa],
        })),

      updateMulta: (multaId, updates) =>
        set((state) => ({
          multas:
            state.multas?.map((multa) =>
              multa.id === multaId ? { ...multa, ...updates } : multa
            ) || null,
        })),

      getMultaById: (id) =>
        get().multas?.find((multa) => multa.id === id) || null,

      getMemberMultas: (memberId) =>
        get().multas?.filter((multa) => multa.memberId === memberId) || null,

      setCapitalMovements: (movements) =>
        set(() => ({ capitalMovements: movements })),

      addCapitalMovement: (movement) =>
        set((state) => ({
          capitalMovements: [...(state.capitalMovements || []), movement],
        })),

      setLoading: (isLoading) => set(() => ({ isLoading })),

      setError: (error) => set(() => ({ error })),

      reset: () => set(initialState),
    }),
    {
      name: 'multa-store',
      partialize: (state) => ({
        multas: state.multas,
        capitalMovements: state.capitalMovements,
      }),
    }
  )
);
