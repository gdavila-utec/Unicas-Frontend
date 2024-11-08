import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PaymentHistory, CapitalMovement, Prestamo } from '../types';

type StoreState = {
  selectedPayment: PaymentHistory | null;
  payments: PaymentHistory[] | null;
  capitalMovements: CapitalMovement[] | null;
  isLoading: boolean;
  error: string | null;
};

type StoreActions = {
  // Payment management
  setSelectedPayment: (payment: PaymentHistory | null) => void;
  setPayments: (payments: PaymentHistory[] | null) => void;
  addPayment: (
    payment: PaymentHistory,
    juntaId: string,
    generateCapitalMovement?: boolean
  ) => void;
  updatePayment: (paymentId: string, updates: Partial<PaymentHistory>) => void;
  deletePayment: (paymentId: string) => void;
  getPaymentById: (id: string) => PaymentHistory | null;

  // Loan-related payment queries
  getLoanPayments: (loanId: string) => PaymentHistory[] | null;
  getMemberPayments: (memberId: string) => PaymentHistory[] | null;
  getLoanTotalPaid: (loanId: string) => {
    total: number;
    principal: number;
    interest: number;
  };
  getRemainingAmounts: (loanId: string) => {
    principal: number;
    interest: number;
    installments: number;
  } | null;
  getPaymentsByDateRange: (
    startDate: Date,
    endDate: Date
  ) => PaymentHistory[] | null;
  getPaymentsByStatus: (
    status: PaymentHistory['status']
  ) => PaymentHistory[] | null;

  // Capital movement management
  setCapitalMovements: (movements: CapitalMovement[] | null) => void;
  addCapitalMovement: (movement: CapitalMovement) => void;
  getPaymentCapitalMovements: (paymentId: string) => CapitalMovement[] | null;

  // Batch operations
  addBatchPayments: (payments: PaymentHistory[], juntaId: string) => void;

  // State management
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

type PagosStore = StoreState & StoreActions;

const initialState: StoreState = {
  selectedPayment: null,
  payments: null,
  capitalMovements: null,
  isLoading: false,
  error: null,
};

// Helper function to create a capital movement from a payment
const createCapitalMovement = (
  payment: PaymentHistory,
  juntaId: string
): CapitalMovement => ({
  id: crypto.randomUUID(),
  amount: payment.amount,
  type: 'PAYMENT',
  direction: 'IN',
  description: `Payment for loan ${payment.prestamoId}`,
  createdAt: new Date(),
  juntaId,
  prestamoId: payment.prestamoId,
  pagoId: payment.id,
  multaId: undefined,
  accionId: undefined,
});

export const usePagosStore = create<PagosStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSelectedPayment: (payment) =>
        set(() => ({ selectedPayment: payment })),

      setPayments: (payments) => set(() => ({ payments })),

      addPayment: (payment, juntaId, generateCapitalMovement = true) =>
        set((state) => {
          const newState: Partial<StoreState> = {
            payments: [...(state.payments || []), payment],
          };

          if (generateCapitalMovement) {
            const capitalMovement = createCapitalMovement(payment, juntaId);
            newState.capitalMovements = [
              ...(state.capitalMovements || []),
              capitalMovement,
            ];
          }

          return newState;
        }),

      updatePayment: (paymentId, updates) =>
        set((state) => ({
          payments:
            state.payments?.map((payment) =>
              payment.id === paymentId ? { ...payment, ...updates } : payment
            ) || null,
          selectedPayment:
            state.selectedPayment?.id === paymentId
              ? { ...state.selectedPayment, ...updates }
              : state.selectedPayment,
        })),

      deletePayment: (paymentId) =>
        set((state) => ({
          payments:
            state.payments?.filter((payment) => payment.id !== paymentId) ||
            null,
          capitalMovements:
            state.capitalMovements?.filter(
              (movement) => movement.pagoId !== paymentId
            ) || null,
          selectedPayment:
            state.selectedPayment?.id === paymentId
              ? null
              : state.selectedPayment,
        })),

      getPaymentById: (id) =>
        get().payments?.find((payment) => payment.id === id) || null,

      getLoanPayments: (loanId) =>
        get().payments?.filter((payment) => payment.prestamoId === loanId) ||
        null,

      getMemberPayments: (memberId) =>
        get().payments?.filter((payment) => payment.memberId === memberId) ||
        null,

      getLoanTotalPaid: (loanId) => {
        const payments =
          get().payments?.filter((p) => p.prestamoId === loanId) || [];
        return {
          total: payments.reduce((sum, p) => sum + p.amount, 0),
          principal: payments.reduce((sum, p) => sum + p.principal_paid, 0),
          interest: payments.reduce((sum, p) => sum + p.interest_paid, 0),
        };
      },

      getRemainingAmounts: (loanId) => {
        const latestPayment = get()
          .payments?.filter((p) => p.prestamoId === loanId)
          .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())[0];

        if (!latestPayment) return null;

        return {
          principal: latestPayment.remaining_amount,
          interest: latestPayment.remaining_interest,
          installments: latestPayment.remaining_installments,
        };
      },

      getPaymentsByDateRange: (startDate, endDate) =>
        get().payments?.filter((payment) => {
          const paymentDate = new Date(payment.date);
          return paymentDate >= startDate && paymentDate <= endDate;
        }) || null,

      getPaymentsByStatus: (status) =>
        get().payments?.filter((payment) => payment.status === status) || null,

      setCapitalMovements: (movements) =>
        set(() => ({ capitalMovements: movements })),

      addCapitalMovement: (movement) =>
        set((state) => ({
          capitalMovements: [...(state.capitalMovements || []), movement],
        })),

      getPaymentCapitalMovements: (paymentId) =>
        get().capitalMovements?.filter(
          (movement) => movement.pagoId === paymentId
        ) || null,

      addBatchPayments: (payments, juntaId) =>
        set((state) => {
          const newPayments = [...(state.payments || []), ...payments];
          const newCapitalMovements = [
            ...(state.capitalMovements || []),
            ...payments.map((payment) =>
              createCapitalMovement(payment, juntaId)
            ),
          ];

          return {
            payments: newPayments,
            capitalMovements: newCapitalMovements,
          };
        }),

      setLoading: (isLoading) => set(() => ({ isLoading })),

      setError: (error) => set(() => ({ error })),

      reset: () => set(initialState),
    }),
    {
      name: 'pagos-store',
      partialize: (state) => ({
        payments: state.payments,
        capitalMovements: state.capitalMovements,
      }),
    }
  )
);

// Helper types for filtering and querying
export type PaymentFilters = {
  prestamoId?: string;
  memberId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  status?: PaymentHistory['status'];
  payment_method?: string;
};

export type PaymentSort = {
  field: keyof Pick<
    PaymentHistory,
    'date' | 'amount' | 'created_at' | 'updated_at'
  >;
  direction: 'asc' | 'desc';
};

// Helper functions for filtering and sorting payments
export const filterPayments = (
  payments: PaymentHistory[] | null,
  filters: PaymentFilters
): PaymentHistory[] => {
  if (!payments) return [];

  return payments.filter((payment) => {
    if (filters.prestamoId && payment.prestamoId !== filters.prestamoId)
      return false;
    if (filters.memberId && payment.memberId !== filters.memberId) return false;
    if (filters.status && payment.status !== filters.status) return false;
    if (
      filters.payment_method &&
      payment.payment_method !== filters.payment_method
    )
      return false;
    if (filters.minAmount && payment.amount < filters.minAmount) return false;
    if (filters.maxAmount && payment.amount > filters.maxAmount) return false;
    if (filters.startDate && new Date(payment.date) < filters.startDate)
      return false;
    if (filters.endDate && new Date(payment.date) > filters.endDate)
      return false;
    return true;
  });
};

export const sortPayments = (
  payments: PaymentHistory[],
  sort: PaymentSort
): PaymentHistory[] => {
  return [...payments].sort((a, b) => {
    const aValue =
      sort.field === 'date' ||
      sort.field === 'created_at' ||
      sort.field === 'updated_at'
        ? new Date(a[sort.field]).getTime()
        : a[sort.field];
    const bValue =
      sort.field === 'date' ||
      sort.field === 'created_at' ||
      sort.field === 'updated_at'
        ? new Date(b[sort.field]).getTime()
        : b[sort.field];

    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sort.direction === 'asc' ? comparison : -comparison;
  });
};
