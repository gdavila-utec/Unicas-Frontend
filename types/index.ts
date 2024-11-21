import { FC } from 'react';
import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  label: string;
  route: string;
  icon: LucideIcon;
  color: string;
}

export interface BaseStepProps {
  juntaId: string;
}

export interface StepComponentProps {
  juntaId: string;
  menuItems: MenuItem[];
}

export interface MenuStepProps extends BaseStepProps {
  menuItems: MenuItem[];
}


export interface User {
  id: string;
  username: string;
  email: string | null;
  full_name: string | null;
  document_type: DocumentType;
  document_number: string | null;
  phone: string | null;
  address: string | null;
  birth_date: string | null;
  gender: Gender | null;
  productive_activity: string | null;
  role: Role;
  member_role: MemberRole;
  status: UserStatus;
  password?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  user: User;
  juntaId: string;
  additional_info: string | null;
  beneficiary_address: string | null;
  beneficiary_document_number: string | null;
  beneficiary_document_type: DocumentType | null;
  beneficiary_full_name: string | null;
  beneficiary_phone: string | null;
  join_date: string | null;
  createdAt: string;
  updatedAt: string;
  full_name: string | null;
  email: string | null;
  document_type: DocumentType | null;
  document_number: string | null;
  phone: string | null;
  address: string | null;
  birth_date: string | null;
}

// Define the return type structure
export interface SharesByMemberReturn {
  memberId: string;
  memberInfo: {
    fullName: string | null;
    documentNumber: string | null;
    memberRole: MemberRole | null;
    beneficiaryInfo: {
      name: string | null;
      document: string | null;
      address: string | null;
      phone: string | null;
    };
  };
  shares: Array<{
    amount: number;
    shareValue: number;
    date: string;
    type: 'COMPRA' | 'VENTA';
  }>;
  totalShares: number;
}

export interface MemberInfo {
  acciones: number; // Number of shares
  accionesValue: number; // Total value of shares
  prestamosValue: number; // Total value of loans
}

export interface MemberResponse {
  id: string;
  username: string;
  email: string | null;
  full_name: string | null;
  document_type: DocumentType | null;
  document_number: string | null;
  phone: string | null;
  address: string | null;
  birth_date: string | null;
  gender: Gender | null;
  productive_activity: string | null;
  role: Role;
  member_role: MemberRole | null;
  status: UserStatus;
  password?: string;
  createdAt: string;
  updatedAt: string;
  joinedAt: string;
  // Beneficiary fields from Member
  additional_info: string | null;
  beneficiary_address: string | null;
  beneficiary_document_number: string | null;
  beneficiary_document_type: DocumentType | null;
  beneficiary_full_name: string | null;
  beneficiary_phone: string | null;
  join_date: string | null;
}

// export interface Junta {
//   id: string;
//   name: string;
//   description: string | null;
//   fecha_inicio: string;
//   available_capital: number;
//   base_capital: number;
//   current_capital: number;
//   createdAt: string;
//   createdBy: User;
//   createdById: string;
//   members: Member[];
//   acciones?: Accion[];
// }

export interface JuntaMember {
  id: string;
  juntaId: string;
  userId: string;
  joinedAt: Date;
  user: User;
  junta: Junta;
}

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
  members: Member[];
  acciones: Accion[];
  agenda: AgendaItem[];
  capital?: CapitalSocial;
  multas: Multa[];
  prestamos: Prestamo[];
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

export interface UseJuntaDashboardResult {
  junta: Junta | undefined;
  members: Member[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  availableCapital: number;
}

export interface Accion {
  id: string;
  type: 'COMPRA' | 'VENTA';
  amount: number;
  shareValue: number;
  description: string;
  affects_capital: boolean;
  juntaId: string;
  memberId: string; // Add this field
  member: MemberResponse;
  createdAt: string;
  updatedAt: string;
}

// New DTO for creating acciones
export interface CreateAccionDTO {
  type: 'COMPRA' | 'VENTA';
  amount: number;
  shareValue: number;
  description: string;
  juntaId: string;
  memberId: string;
}

// Form values interface
export interface AccionFormValues {
  memberId: string;
  date: Date;
  amount: number;
  description?: string;
}

// Form Types
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

// Enums and Constants
export type DocumentType = 'DNI' | 'CE';

export type Gender = 'Masculino' | 'Femenino' | 'Otro';

export type Role = 'ADMIN' | 'USER';

export type MemberRole = 'socio' | 'presidente' | 'tesorero' | 'secretario';

export type UserStatus = 'Activo' | 'Inactivo' | 'Pendiente';

export type CapitalAmount = {
  base: number;
  available: number;
  total: number;
};

// Configuration Types
export interface BoardConfig {
  shareValue: number;
  meetingDate: string;
  monthlyInterestRate: number;
  latePaymentFee: number;
  absenceFee: number;
  defaultInterestRate: number;
  loanFormValue: number;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T; // The generic type T represents the data type
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Error Types
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
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

// types/prestamos.ts
export interface LoanFormData {
  memberId: string;
  requestDate: string;
  amount: number;
  monthlyInterest: number;
  installments: number;
  paymentType: string;
  reason: string;
  guaranteeType: GuaranteeType;
  guaranteeDetail: string;
  formPurchased: boolean;
  formCost: number;
}

export interface CreateLoanPayload {
  juntaId: string;
  memberId: string;
  request_date: string;
  amount: string;
  monthly_interest: string;
  number_of_installments: number;
  loan_type: string;
  reason: string;
  guarantee_type: GuaranteeType;
  guarantee_detail: string;
  form_purchased: boolean;
  form_cost: number;
  payment_type: PaymentType;
}

export interface UsePrestamosResult {
  prestamos: Prestamo[];
  members: MemberResponse[];
  formData: LoanFormData;
  updateFormField: (field: string, value: string | number | boolean) => void;
  isLoading: boolean;
  setFormData: (data: LoanFormData) => void;
  updateFormData: (data: LoanFormData) => void;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleGuaranteeTypeChange: (
    value: 'AVAL' | 'INMUEBLE' | 'HIPOTECARIA' | 'PRENDARIA'
  ) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleDeleteLoan: (id: string) => Promise<void>;
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
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL';
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
