import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Junta } from '../types';

interface CapitalState {
  available_capital: number;
}

interface CapitalActions {
  updateAvailableCapital: (junta: Junta | null) => void;
  getAvailableCapital: () => number;
  resetCapital: () => void;
}

type CapitalStore = CapitalState & CapitalActions;

const initialState: CapitalState = {
  available_capital: 0,
};

export const useCapitalStore = create<CapitalStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      updateAvailableCapital: (junta) =>
        set(() => ({
          available_capital: junta?.available_capital ?? 0,
        })),

      getAvailableCapital: () => get().available_capital,

      resetCapital: () => set(initialState),
    }),
    {
      name: 'capital-store',
    }
  )
);
