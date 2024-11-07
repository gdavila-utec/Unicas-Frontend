import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Prestamo, PaymentSchedule } from '../types';

// Define store type by combining state and actions
type PrestamoStore = StoreState & StoreActions;

// State interface
interface StoreState {
  selectedLoan: Prestamo | null;
  loans: Prestamo[];
  paymentSchedules: PaymentSchedule[];
  isLoading: boolean;
  error: string | null;
}

// Loan filters interface
interface LoanFilters {
  status?: string;
  loanType?: string;
  juntaId?: string;
  memberId?: string;
  approved?: boolean;
  rejected?: boolean;
  paid?: boolean;
  minAmount?: number;
  maxAmount?: number;
  startDate?: Date;
  endDate?: Date;
  affectsCapital?: boolean;
}

// Loan metrics interface
interface LoanMetrics {
  totalLoans: number;
  activeLoans: number;
  totalAmount: number;
  pendingAmount: number;
  approvedLoans: number;
  rejectedLoans: number;
  paidLoans: number;
}

// Actions interface
interface StoreActions {
  // Loan management
  setSelectedLoan: (loan: Prestamo | null) => void;
  setLoans: (loans: Prestamo[]) => void;
  addLoan: (loan: Prestamo) => void;
  updateLoan: (loanId: string, updates: Partial<Prestamo>) => void;

  // Loan queries
  getLoanById: (id: string) => Prestamo | null;
  getLoans: (filters?: LoanFilters) => Prestamo[];
  getMemberLoans: (memberId: string) => Prestamo[];
  getJuntaLoans: (juntaId: string) => Prestamo[];
  getActiveLoansByMember: (memberId: string) => Prestamo[];

  // Payment schedule
  setPaymentSchedules: (schedules: PaymentSchedule[]) => void;
  updatePaymentSchedule: (
    scheduleId: string,
    updates: Partial<PaymentSchedule>
  ) => void;
  getLoanSchedule: (loanId: string) => PaymentSchedule[];

  // Status calculations
  getTotalLentAmount: (juntaId?: string) => number;
  getTotalPendingAmount: (juntaId?: string) => number;
  getLoanMetrics: (juntaId?: string) => LoanMetrics;

  // State management
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// Loan sort type
type LoanSortField =
  | 'amount'
  | 'request_date'
  | 'monthly_interest'
  | 'remaining_amount';

const initialState: StoreState = {
  selectedLoan: null,
  loans: [],
  paymentSchedules: [],
  isLoading: false,
  error: null,
};

export const usePrestamoStore = create<PrestamoStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSelectedLoan: (loan: Prestamo | null) =>
        set(() => ({ selectedLoan: loan })),

      setLoans: (loans: Prestamo[]) => set(() => ({ loans })),

      addLoan: (loan: Prestamo) =>
        set((state) => ({
          loans: [...state.loans, loan], // No need to check for null
        })),

      updateLoan: (loanId, updates) =>
        set((state) => ({
          loans: state.loans.map(
            (
              loan // No need to check for null
            ) => (loan.id === loanId ? { ...loan, ...updates } : loan)
          ),
          selectedLoan:
            state.selectedLoan?.id === loanId
              ? { ...state.selectedLoan, ...updates }
              : state.selectedLoan,
        })),

      getLoanById: (id) => get().loans.find((loan) => loan.id === id) || null,

      getLoans: (filters) => {
        const loans = get().loans;
        if (!filters) return loans;

        return loans.filter((loan) => {
          if (filters.status && loan.status !== filters.status) return false;
          if (filters.loanType && loan.loan_type !== filters.loanType)
            return false;
          if (filters.juntaId && loan.juntaId !== filters.juntaId) return false;
          if (filters.memberId && loan.memberId !== filters.memberId)
            return false;
          if (
            filters.approved !== undefined &&
            loan.approved !== filters.approved
          )
            return false;
          if (
            filters.rejected !== undefined &&
            loan.rejected !== filters.rejected
          )
            return false;
          if (filters.paid !== undefined && loan.paid !== filters.paid)
            return false;
          if (filters.minAmount && loan.amount < filters.minAmount)
            return false;
          if (filters.maxAmount && loan.amount > filters.maxAmount)
            return false;
          if (
            filters.startDate &&
            new Date(loan.request_date) < filters.startDate
          )
            return false;
          if (filters.endDate && new Date(loan.request_date) > filters.endDate)
            return false;
          if (
            filters.affectsCapital !== undefined &&
            loan.affects_capital !== filters.affectsCapital
          )
            return false;
          return true;
        });
      },

      getMemberLoans: (memberId) =>
        get().loans.filter((loan) => loan.memberId === memberId),

      getJuntaLoans: (juntaId) =>
        get().loans.filter((loan) => loan.juntaId === juntaId),

      getActiveLoansByMember: (memberId) =>
        get().loans.filter(
          (loan) =>
            loan.memberId === memberId &&
            loan.approved &&
            !loan.paid &&
            !loan.rejected
        ),

      setPaymentSchedules: (schedules) =>
        set(() => ({ paymentSchedules: schedules })),

      updatePaymentSchedule: (scheduleId, updates) =>
        set((state) => ({
          paymentSchedules: state.paymentSchedules.map((schedule) =>
            schedule.id === scheduleId ? { ...schedule, ...updates } : schedule
          ),
        })),

      getLoanSchedule: (loanId) =>
        get().paymentSchedules.filter(
          (schedule) => schedule.prestamoId === loanId
        ),

      getTotalLentAmount: (juntaId) =>
        get()
          .loans.filter(
            (loan) => loan.approved && (!juntaId || loan.juntaId === juntaId)
          )
          .reduce((total, loan) => total + loan.amount, 0),

      getTotalPendingAmount: (juntaId) =>
        get()
          .loans.filter(
            (loan) =>
              loan.approved &&
              !loan.paid &&
              (!juntaId || loan.juntaId === juntaId)
          )
          .reduce((total, loan) => total + loan.remaining_amount, 0),

      getLoanMetrics: (juntaId) => {
        const filteredLoans = juntaId
          ? get().loans.filter((loan) => loan.juntaId === juntaId)
          : get().loans;

        return {
          totalLoans: filteredLoans.length,
          activeLoans: filteredLoans.filter(
            (l) => l.approved && !l.paid && !l.rejected
          ).length,
          totalAmount: filteredLoans.reduce((sum, l) => sum + l.amount, 0),
          pendingAmount: filteredLoans.reduce(
            (sum, l) => sum + (l.remaining_amount || 0),
            0
          ),
          approvedLoans: filteredLoans.filter((l) => l.approved).length,
          rejectedLoans: filteredLoans.filter((l) => l.rejected).length,
          paidLoans: filteredLoans.filter((l) => l.paid).length,
        };
      },

      setLoading: (isLoading) => set(() => ({ isLoading })),

      setError: (error) => set(() => ({ error })),

      reset: () => set(initialState),
    }),
    {
      name: 'prestamo-store',
      partialize: (state) => ({
        loans: state.loans,
        paymentSchedules: state.paymentSchedules,
      }),
    }
  )
);

// Helper function remains the same
export type LoanSort = {
  field: keyof Pick<
    Prestamo,
    'amount' | 'request_date' | 'monthly_interest' | 'remaining_amount'
  >;
  direction: 'asc' | 'desc';
};

export const sortLoans = (loans: Prestamo[], sort: LoanSort): Prestamo[] => {
  return [...loans].sort((a, b) => {
    const aValue =
      sort.field === 'request_date'
        ? new Date(a[sort.field]).getTime()
        : a[sort.field];
    const bValue =
      sort.field === 'request_date'
        ? new Date(b[sort.field]).getTime()
        : b[sort.field];

    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sort.direction === 'asc' ? comparison : -comparison;
  });
};
