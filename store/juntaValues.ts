import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Junta } from '../types';

type JuntaValues = {
  reserva_legal: number;
  fondo_social: number;
  // juntaId: string;
  junta: Junta | unknown;
  // setJuntaId: (value: string) => void;
  setJunta: (value: unknown) => void;
  setReservaLegal: (value: number) => void;
  setFondoSocial: (value: number) => void;
  resetCapital: () => void;
};

const initialState = {
  reserva_legal: 0,
  fondo_social: 0,
  // juntaId: '',
  junta: null as Junta | unknown,
};

export const useJuntaValues = create<JuntaValues>()(
  persist(
    (set) => ({
      ...initialState,
      // setJuntaId: (value) => set({ juntaId: value }),
      setJunta: (value) => set({ junta: value }),
      setReservaLegal: (value) => set({ reserva_legal: value }),
      setFondoSocial: (value) => set({ fondo_social: value }),
      resetCapital: () => set(initialState),
    }),
    {
      name: 'cache-values',
    }
  )
);
