import { unknown } from 'zod';

export interface User {
  user: any;
  id: string;
  email?: string;
  username: string;
  role: 'ADMIN' | 'FACILITATOR' | 'USER';
  document_type?: string;
  document_number?: string;
  full_name?: string;
  birth_date?: Date;
  address?: string;
  phone: string;
  additional_info?: string;
  beneficiary_address?: string;
  beneficiary_document_number?: string;
  beneficiary_document_type?: string;
  beneficiary_full_name?: string;
  beneficiary_phone?: string;
  gender?: string;
  join_date?: Date;
  member_role?: string;
  productive_activity?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  acciones: Accion[];
  createdJuntas: Junta[];
  memberJuntas: JuntaMember[];
  multas: Multa[];
  prestamos: Prestamo[];
}

// Type definitions
export type MemberRole = 'socio' | 'presidente' | 'tesorero' | 'secretario';
export type DocumentType = 'DNI' | 'CE';
export type Gender = 'Masculino' | 'Femenino' | 'Otro';
export type Status = 'Activo' | 'Inactivo';

export interface UseErrorReturn {
  perro: string | null;
  setError: (error: unknown) => void;
  clearError: () => void;
  isError: boolean;
}

export interface ErrorType extends Error {
  cause?: ErrorType;
  message: string;
  error: string;
  response: {
    data: {
      message: string;
      error: string;
    };
  };
}

export interface NewMemberForm {
  id: string;
  full_name: string;
  document_type: DocumentType;
  document_number: string;
  role: MemberRole;
  productive_activity: string;
  birth_date: string;
  phone: string;
  address: string;
  join_date: string;
  gender: Gender;
  password: string;
  additional_info: string;
  beneficiary: {
    full_name: string;
    document_type: DocumentType;
    document_number: string;
    phone: string;
    address: string;
  };
}

export interface Beneficiary {
  full_name: string;
  document_type: DocumentType;
  document_number: string;
  phone: string;
  address: string;
}

export type AgendaItem = {
  id: string;
  title: string;
  description?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  juntaId: string;
  junta: Junta;
};

// Junta types
export interface Junta {
  data: Partial<Junta>;
  id: string;
  name: string;
  description?: string;
  fecha_inicio: Date;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  available_capital: number;
  base_capital: number;
  current_capital: number;
  createdBy: User;
  members: JuntaMember[];
  acciones: Accion[];
  agenda: AgendaItem[];
  capital?: CapitalSocial;
  multas: Multa[];
  prestamos: Prestamo[];
}

export interface JuntaMember {
  id: string;
  juntaId: string;
  userId: string;
  joinedAt: Date;
  user: User;
  junta: Junta;
}

export interface Member {
  id: string;
  email: string;
  username: string;
  password: string;
  phone: string;
  role: MemberRole;
  member_role: string;
  document_type: DocumentType;
  document_number: string;
  full_name: string;
  productive_activity: string;
  birth_date: string;
  address: string;
  join_date: string;
  joinedAt: string;
  gender: Gender;
  additional_info: string;
  status: Status;
  beneficiary_full_name: string;
  beneficiary_document_type: string;
  beneficiary_document_number: string;
  beneficiary_phone: string;
  beneficiary_address: string;
  createdAt: string;
  updatedAt: string;
  beneficiary: Beneficiary;
}

// Capital types
export interface CapitalMovement {
  id: string;
  amount: number;
  type: string;
  direction: string;
  description?: string;
  createdAt: Date;
  juntaId: string;
  prestamoId?: string;
  multaId?: string;
  accionId?: string;
  pagoId?: string;
}

export interface CapitalSocial {
  id: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
  juntaId: string;
  gastos: GastoCapital[];
  ingresos: IngresoCapital[];
}

export interface IngresoCapital {
  id: string;
  amount: number;
  description: string;
  date: Date;
  capitalSocialId: string;
}

export interface GastoCapital {
  id: string;
  amount: number;
  description: string;
  date: Date;
  capitalSocialId: string;
}

// Accion types
export interface Accion {
  id: string;
  type: string;
  amount: number;
  shareValue: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  juntaId: string;
  memberId: string;
  affects_capital: boolean;
  member: Member;
  junta: Junta;
}

// Prestamo types
export interface Prestamo {
  id: string;
  amount: number;
  description?: string;
  status: string;
  request_date: Date;
  monthly_interest: number;
  number_of_installments: number;
  approved: boolean;
  rejected: boolean;
  rejection_reason?: string;
  paid: boolean;
  remaining_amount: number;
  createdAt: Date;
  updatedAt: Date;
  juntaId: string;
  memberId: string;
  original_prestamo_id?: string;
  affects_capital: boolean;
  avalId?: string;
  capital_at_time: number;
  capital_snapshot?: unknown;
  form_cost: number;
  form_purchased: boolean;
  guarantee_detail?: string;
  guarantee_type: string;
  loan_code: string;
  loan_number: number;
  payment_type: string;
  reason: string;
  loan_type: string;
  pagos: Pago[];
  junta: Junta;
  member: User;
  paymentSchedule: PaymentSchedule[];
}

// Pago types
export interface PagoPrestamo {
  id: string;
  amount: number;
  date: Date;
  prestamoId: string;
  original_pago_id?: string;
  affects_capital: boolean;
  prestamo: Prestamo;
}

export interface Pago {
  id: string;
  amount: number;
  date: Date;
  memberName: string;
  fecha_pago: Date;
  capital_payment: number;
  interest_payment: number;
  late_payment: number;
  quota_payment: number;
  remaining_balance: number;
  remaining_installments: number;
  prestamoId: string;
  original_pago_id?: string;
  affects_capital: boolean;
  prestamo: Prestamo;
}

export interface PagoItem {
  id: string;
  amount: number;
  date: string;
  prestamoId: string;
  original_pago_id?: string;
  affects_capital: boolean;
  prestamo: {
    member: {
      full_name: string;
    };
    remaining_amount: number;
    monthly_interest: number;
  };
}

export interface FormattedPago {
  id: string;
  amount: number;
  date: string;
  prestamoId: string;
  original_pago_id?: string;
  affects_capital: boolean;
  prestamo: {
    member: {
      full_name: string;
    };
    remaining_amount: number;
    monthly_interest: number;
  };
  memberName: string;
  fecha_pago: string;
  capital_payment: number;
  interest_payment: number;
  late_payment: number;
  quota_payment: number;
  remaining_balance: number;
  remaining_installments: number;
}

// Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Multa {
  id: string;
  amount: number;
  description: string;
  status: MultaStatus; // Default: "PENDING"
  createdAt: Date;
  updatedAt: Date;
  juntaId: string;
  memberId: string;
  affects_capital: boolean;
  junta?: Junta;
  member?: User;
  capital_movements?: CapitalMovement[];
}

// You might also want these enums for the status field
enum MultaStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export type PaymentType = 'MENSUAL' | 'QUINCENAL' | 'SEMANAL';

export type GuaranteeType = 'AVAL' | 'INMUEBLE' | 'HIPOTECARIA' | 'PRENDARIA';

export interface CreatePrestamoDto {
  juntaId: string;
  memberId: string;
  number_of_installments: number;
  loan_type:
    | 'CUOTA_REBATIR'
    | 'CUOTA_FIJA'
    | 'CUOTA_VENCIMIENTO'
    | 'CUOTA_VARIABLE';
  payment_type: PaymentType;
  reason: string;
  guarantee_type: 'AVAL' | 'INMUEBLE' | 'HIPOTECARIA' | 'PRENDARIA';
  guarantee_detail: string;
  form_purchased: boolean;
  amount: string;
  monthly_interest: string;
  request_date: string;
}

export interface Payment {
  id: string;
  due_date: string;
  expected_amount: number;
  principal: number;
  interest: number;
  installment_number: number;
  prestamoId: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  createdAt: string;
  updatedAt: string;
  checkValue: boolean;
}

export interface LoanStatus {
  totalPaid: number;
  remainingAmount: number;
  remainingPayments: Payment[];
  nextPaymentDue: Payment;
  nextPaymentDate: string;
  isOverdue: boolean;
}

export interface PaymentSchedule {
  id: string;
  due_date: Date;
  expected_amount: number;
  principal: number;
  interest: number;
  installment_number: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  prestamoId: string;
}

export interface PaymentHistory {
  id: string;
  prestamoId: string;
  amount: number;
  date: Date;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  payment_method?: string;
  reference_number?: string;
  created_at: Date;
  updated_at: Date;
  prestamo: Prestamo;
  principal_paid: number;
  remaining_amount: number;
  remaining_interest: number;
  interest_paid: number;
  remaining_installments: number;
  memberId: string;
}
