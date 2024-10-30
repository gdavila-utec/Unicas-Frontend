import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type BoardConfig = {
  meetingDate: number;
  shareValue: number;
  monthlyInterestRate: number;
  latePaymentFee: number;
  absenceFee: number;
  defaultInterestRate: number;
  loanFormValue: number;
  setMeetingDate: (value: number) => void;
  setShareValue: (value: number) => void;
  setMonthlyInterestRate: (rate: number) => void;
  setLatePaymentFee: (fee: number) => void;
  setAbsenceFee: (fee: number) => void;
  setDefaultInterestRate: (rate: number) => void;
  setLoanFormValue: (value: number) => void;
  resetConfig: () => void;
};

const initialState = {
  meetingDate: 0,
  shareValue: 0,
  monthlyInterestRate: 0,
  latePaymentFee: 0,
  absenceFee: 0,
  defaultInterestRate: 0,
  loanFormValue: 0,
};

export const useBoardConfig = create<BoardConfig>()(
  persist(
    (set) => ({
      ...initialState,
      setMeetingDate: (value) => set({ meetingDate: value }),
      setShareValue: (value) => set({ shareValue: value }),
      setMonthlyInterestRate: (rate) => set({ monthlyInterestRate: rate }),
      setLatePaymentFee: (fee) => set({ latePaymentFee: fee }),
      setAbsenceFee: (fee) => set({ absenceFee: fee }),
      setDefaultInterestRate: (rate) => set({ defaultInterestRate: rate }),
      setLoanFormValue: (value) => set({ loanFormValue: value }),
      resetConfig: () => set(initialState),
    }),
    {
      name: 'board-config',
    }
  )
);
