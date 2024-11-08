import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Accion, CapitalMovement } from '../types';

// Define store type
type AccionesStore = StoreState & StoreActions;

// State interface with non-nullable arrays
interface StoreState {
  selectedAccion: Accion | null;
  acciones: Accion[]; // Changed from Accion[] | null
  capitalMovements: CapitalMovement[]; // Changed from CapitalMovement[] | null
  isLoading: boolean;
  error: string | null;
}

// Actions interface with updated return types
interface StoreActions {
  // Acciones management
  setSelectedAccion: (accion: Accion | null) => void;
  setAcciones: (acciones: Accion[]) => void; // Remove null
  addAccion: (accion: Accion) => void;
  updateAccion: (accionId: string, updates: Partial<Accion>) => void;
  deleteAccion: (accionId: string) => void;

  // Acciones queries
  getAccionById: (id: string) => Accion | null;
  getJuntaAcciones: (juntaId: string) => Accion[]; // Remove null
  getMemberAcciones: (memberId: string) => Accion[]; // Remove null
  getJuntaMemberAcciones: (juntaId: string, memberId: string) => Accion[]; // Remove null

  // Acciones calculations
  getTotalAccionesAmount: (juntaId: string) => number;
  getMemberAccionesAmount: (juntaId: string, memberId: string) => number;
  getAccionesMetrics: (juntaId: string) => AccionesMetrics;

  // Capital movement management
  setCapitalMovements: (movements: CapitalMovement[]) => void; // Remove null
  addCapitalMovement: (movement: CapitalMovement) => void;
  getAccionCapitalMovements: (accionId: string) => CapitalMovement[]; // Remove null

  // State management
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// Metrics interface
interface AccionesMetrics {
  totalAcciones: number;
  totalAmount: number;
  totalMembers: number;
  averagePerMember: number;
  maxAmount: number;
  minAmount: number;
}

const initialState: StoreState = {
  selectedAccion: null,
  acciones: [], // Initialize with empty array
  capitalMovements: [], // Initialize with empty array
  isLoading: false,
  error: null,
};

export const useAccionesStore = create<AccionesStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSelectedAccion: (accion) => set(() => ({ selectedAccion: accion })),

      setAcciones: (acciones) => set(() => ({ acciones })),

      addAccion: (accion) =>
        set((state) => ({
          acciones: [...state.acciones, accion], // No need to check for null
        })),

      updateAccion: (accionId, updates) =>
        set((state) => ({
          acciones: state.acciones.map(
            (
              accion // No need to check for null
            ) => (accion.id === accionId ? { ...accion, ...updates } : accion)
          ),
          selectedAccion:
            state.selectedAccion?.id === accionId
              ? { ...state.selectedAccion, ...updates }
              : state.selectedAccion,
        })),

      deleteAccion: (accionId) =>
        set((state) => ({
          acciones: state.acciones.filter((accion) => accion.id !== accionId),
          capitalMovements: state.capitalMovements.filter(
            (movement) => movement.accionId !== accionId
          ),
          selectedAccion:
            state.selectedAccion?.id === accionId ? null : state.selectedAccion,
        })),

      getAccionById: (id) =>
        get().acciones.find((accion) => accion.id === id) || null,

      getJuntaAcciones: (juntaId) =>
        get().acciones.filter((accion) => accion.juntaId === juntaId),

      getMemberAcciones: (memberId) =>
        get().acciones.filter((accion) => accion.memberId === memberId),

      getJuntaMemberAcciones: (juntaId, memberId) =>
        get().acciones.filter(
          (accion) => accion.juntaId === juntaId && accion.memberId === memberId
        ),

      getTotalAccionesAmount: (juntaId) =>
        get().acciones.reduce(
          (total, accion) =>
            accion.juntaId === juntaId ? total + accion.amount : total,
          0
        ),

      getMemberAccionesAmount: (juntaId, memberId) =>
        get().acciones.reduce(
          (total, accion) =>
            accion.juntaId === juntaId && accion.memberId === memberId
              ? total + accion.amount
              : total,
          0
        ),

      getAccionesMetrics: (juntaId) => {
        const juntaAcciones = get().acciones.filter(
          (accion) => accion.juntaId === juntaId
        );

        const memberAmounts = juntaAcciones.reduce((acc, accion) => {
          acc[accion.memberId] = (acc[accion.memberId] || 0) + accion.amount;
          return acc;
        }, {} as Record<string, number>);

        const amounts = Object.values(memberAmounts);

        return {
          totalAcciones: juntaAcciones.length,
          totalAmount: juntaAcciones.reduce((sum, a) => sum + a.amount, 0),
          totalMembers: Object.keys(memberAmounts).length,
          averagePerMember: amounts.length
            ? amounts.reduce((sum, a) => sum + a, 0) / amounts.length
            : 0,
          maxAmount: amounts.length ? Math.max(...amounts) : 0,
          minAmount: amounts.length ? Math.min(...amounts) : 0,
        };
      },

      setCapitalMovements: (movements) =>
        set(() => ({ capitalMovements: movements })),

      addCapitalMovement: (movement) =>
        set((state) => ({
          capitalMovements: [...state.capitalMovements, movement],
        })),

      getAccionCapitalMovements: (accionId) =>
        get().capitalMovements.filter(
          (movement) => movement.accionId === accionId
        ),

      setLoading: (isLoading) => set(() => ({ isLoading })),

      setError: (error) => set(() => ({ error })),

      reset: () => set(initialState),
    }),
    {
      name: 'acciones-store',
      partialize: (state) => ({
        acciones: state.acciones,
        capitalMovements: state.capitalMovements,
      }),
    }
  )
);

// Helper interfaces
interface AccionFilters {
  juntaId?: string;
  memberId?: string;
  type?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: Date;
  endDate?: Date;
  affects_capital?: boolean;
}

interface AccionSort {
  field: keyof Pick<Accion, 'amount' | 'createdAt' | 'updatedAt' | 'type'>;
  direction: 'asc' | 'desc';
}

export const filterAcciones = (
  acciones: Accion[], // Remove null
  filters: AccionFilters
): Accion[] => {
  return acciones.filter((accion) => {
    if (filters.juntaId && accion.juntaId !== filters.juntaId) return false;
    if (filters.memberId && accion.memberId !== filters.memberId) return false;
    if (filters.type && accion.type !== filters.type) return false;
    if (filters.minAmount && accion.amount < filters.minAmount) return false;
    if (filters.maxAmount && accion.amount > filters.maxAmount) return false;
    if (filters.startDate && new Date(accion.createdAt) < filters.startDate)
      return false;
    if (filters.endDate && new Date(accion.createdAt) > filters.endDate)
      return false;
    if (
      filters.affects_capital !== undefined &&
      accion.affects_capital !== filters.affects_capital
    )
      return false;
    return true;
  });
};

export const sortAcciones = (
  acciones: Accion[],
  sort: AccionSort
): Accion[] => {
  return [...acciones].sort((a, b) => {
    const aValue =
      sort.field === 'createdAt' || sort.field === 'updatedAt'
        ? new Date(a[sort.field]).getTime()
        : a[sort.field];
    const bValue =
      sort.field === 'createdAt' || sort.field === 'updatedAt'
        ? new Date(b[sort.field]).getTime()
        : b[sort.field];

    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sort.direction === 'asc' ? comparison : -comparison;
  });
};

export type {
  AccionesStore,
  StoreState,
  StoreActions,
  AccionesMetrics,
  AccionFilters,
  AccionSort,
};
